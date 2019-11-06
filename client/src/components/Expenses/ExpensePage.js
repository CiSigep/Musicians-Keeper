import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Navbar from "../Navbar";
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { TextField, Input, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import SpanningTable from '../SpanningTable';
import Grid from '@material-ui/core/Grid';
import Cookie from 'js-cookie';
import { withRouter } from "react-router-dom";
// import TextField from '@material-ui/core/TextField';



//Setting up use stylyes for design is from material UI 
const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
    },
    heading: {
        fontSize: theme.typography.pxToRem(15),
        flexBasis: '33.33%',
        flexShrink: 0,
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 200,
    }
}));

//Setting up Expansion panels 
function ControlledExpansionPanels(props) {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
    const [data, setData] = React.useState([]);
    const [openAdd, setOpenAdd] = React.useState(false);
    const [openView, setOpenView] = React.useState(false);
    const [category, setCategory] = React.useState(-1);
    const [expense, setExpense] = React.useState(-1);

    //Function for when it is expanded 
    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);

    };

    //handle input to new expense 
    const handleInput = (id) => {
        let newExpense = {
            name: document.querySelector("#name" + id).value,
            date: document.querySelector("#datePicker" + id).value,
            amount: document.querySelector("#amount" + id).value,
            categoryId: id
        }
        const accessString = localStorage.getItem('JWT');
        axios.post("/api/expense", newExpense,
            { headers: { Authorization: `${accessString}` } }).then(res => {
                let formattedData = res.data
                formattedData.amount = parseFloat(formattedData.amount)
                console.log(formattedData)

                let updatedData = [...data];
                updatedData[formattedData.CategoryId - 1].Expenses.push(formattedData)
                console.log(updatedData)
                // let newExpenses = data.concat([res.data])
                // console.log(newExpenses)
                // setData({ expenses: newExpenses, date: "", purchasedLocation: "", amount: "" })
                setData(updatedData)
                document.querySelector("#name" + id).value = "";
                document.querySelector("#date" + id).value = "";
                document.querySelector("#amount" + id).value = "";
            })

    }

    //use effect hook for JWT on load 
    useEffect(function onLoad() {
        if (Cookie.get("JWT")) {
            let token = Cookie.get("JWT");
            Cookie.remove("JWT");
            localStorage.setItem("JWT", "JWT " + token);
        }

        if (localStorage.getItem("JWT") == null) {
            props.history.push("/signin");
            return;
        }
        //get call item using JWT 
        const accessString = localStorage.getItem('JWT');
        axios.get("/api/expense",
            { headers: { Authorization: `${accessString}` } }).then(res => {
                console.log(res.data)
                setData(res.data)


            })

    }, [])
    //adding image
    const addImg = (id, categoryId) => {
        setCategory(categoryId);
        setExpense(id);
        setOpenAdd(true);
    }
    const handleCloseAdd = () => {
        setOpenAdd(false);
    }
    const handleCloseView = () => {
        setOpenView(false);
    }
    const viewImg = (id) => {
        const accessString = localStorage.getItem('JWT');
        axios.get("/api/expense/" + id + "/image", { headers: { Authorization: `${accessString}` } }).then(res => {
            setOpenView(true);
            document.querySelector("#view").src = res.data;
        });
    }
    //reset document after expense is submitted 
    const fileOnChange = (e) => {
        document.querySelector("#fileName").textContent = e.target.files[0].name;
    }

    const uploadImg = () => {
        if (document.querySelector("#uploadFile").value !== "") {
            const accessString = localStorage.getItem('JWT');
            let imgData = new FormData();
            imgData.set("image", document.querySelector("#uploadFile").files[0]);

            axios.post("/api/expense/" + expense + "/image", imgData, {
                headers: {
                    Authorization: `${accessString}`,
                    "Content-Type": "multipart/form-data"
                }
            }).then(res => {
                let updatedData = [...data];

                updatedData[category - 1].Expenses.find(ele => ele.id === expense).img = true;

                setData(updatedData);

                setOpenAdd(false);
            });
        }
    }

    const setName = ((event) => {
        const { name, value } = event.target
        this.setState({ [name]: value })
    })

    //onButtonSubmit = (event) => {
    const getJWT = ((event) => {
        event.preventDefault();
        const accessString = localStorage.getItem('JWT');
        axios.post("/api/expenses", {
            date: this.state.date,
            name: this.state.name,
            amount: this.state.amount
        },
            {


                headers: {
                    headers: { Authorization: `JWT ${accessString}` }
                }
            }).then(res => {
                console.log(res)
                let newExpenses = this.state.expenses.concat([res.data])
                this.setState({ expenses: newExpenses, date: "", purchasedLocation: "", amount: "" })
            })


    })
    //delete element by id 
    const handleDelete = (categoryId, id) => {
        const accessString = localStorage.getItem('JWT');
        axios.delete("/api/expense/" + id, { headers: { Authorization: `${accessString}` } }).then(res => {
            let updatedData = [...data];
            let newExpenses = updatedData[categoryId - 1].Expenses.filter(ele => ele.id !== id);
            updatedData[categoryId - 1].Expenses = newExpenses;
            setData(updatedData);

        })

    }
    return (

        //Expansion panel dislay 
        <div className={classes.root}>
            <Navbar />
            {data.map((ele, idx) => {
                return (<ExpansionPanel expanded={expanded === 'panel' + ele.id} onChange={handleChange('panel' + ele.id)} key={idx}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography className={classes.heading}>{ele.name}</Typography>
                        <Typography className={classes.secondaryHeading}>{ele.description}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails className={"customFormContainer"}>

                        <Grid container>
                            <Grid item xs={12}>



                                <TextField id={"datePicker" + ele.id} className={classes.textField} label="Date" type="date" InputLabelProps={{ shrink: true }} />
                                <TextField id={"name" + ele.id} className={classes.textField} label="Name" margin="normal" />
                                <TextField id={"amount" + ele.id} className={classes.textField} label="Amount" margin="normal" />
                                <Button variant="contained" color="black" margin="normal" onClick={() => { handleInput(ele.id) }} className={`${classes.button}` + " formButton"} />


                            </Grid>
                            <Grid item xs={12}>
                                <SpanningTable items={ele.Expenses} handleDelete={handleDelete} addImg={addImg} viewImg={viewImg} categoryId={ele.id} />
                            </Grid>
                        </Grid>


                    </ExpansionPanelDetails>
                </ExpansionPanel>)
            })}
            <Dialog open={openAdd} onClose={handleCloseAdd} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add Image</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Pick an image to add:
                    </DialogContentText>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        Add File
                    <input
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            id="uploadFile"
                            onChange={fileOnChange}
                        />
                    </Button>
                    <br />
                    <DialogContentText>
                        <span id="fileName"></span>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAdd} color="primary">
                        Cancel
                </Button>
                    <Button onClick={uploadImg} color="primary">
                        Upload
                </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openView} onClose={handleCloseView} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Image</DialogTitle>
                <DialogContent>
                    <img id="view" alt="receipt"></img>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseView} color="primary">
                        Close
                </Button>
                </DialogActions>
            </Dialog>


        </div>



    );




};


export default withRouter(ControlledExpansionPanels);

