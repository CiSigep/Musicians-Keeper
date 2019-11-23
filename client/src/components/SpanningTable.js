import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import moment from 'moment';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing(3),
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
}));

function ccyFormat(num) {
    return `${num.toFixed(2)}`;
}

//totals table amount 

function total(items) {
    return items.map(({ amount }) => amount).reduce((sum, i) => sum + i, 0);
}

export default function SpanningTable(props) {
    const classes = useStyles();

    const viewImg = (id) =>  {
        props.viewImg(id);
    };

    const addImg = (id) => {
        props.addImg(id, props.categoryId);
    };

    const [loading, setLoading] = useState(false);

    return (
        <Paper className={classes.root}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell>Image</TableCell>
                        <TableCell align="right">Date</TableCell>
                        <TableCell align="right">Name</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Delete</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.items.map(row => (
                        <TableRow key={row.name}>
                            <TableCell><Button onClick={row.img ? () => { viewImg(row.id) } : () => { addImg(row.id) }}>{row.img ? "View" : "Add"}</Button></TableCell>
                            <TableCell align="right">{moment(row.date).format("MM/DD/YYYY")}</TableCell>
                            <TableCell align="right">{row.name}</TableCell>
                            <TableCell align="right">{ccyFormat(row.amount)}</TableCell>
                            <TableCell align="right"> <Button disabled={loading} onClick = {()=> {
                                setLoading(true);
                                props.handleDelete(row.CategoryId,row.id, () => {setLoading(false)});
                            }} > <DeleteIcon /></Button></TableCell>
                        </TableRow>
                    ))}

                    <TableRow>
                        <TableCell colSpan={3} align="right">Total</TableCell>
                        <TableCell align="right">{ccyFormat(total(props.items))}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Paper>
    );
}