import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { makeStyles } from '@mui/styles';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector, useFormInputs } from "../hooks";
import { removeEndpoint, editEndpoint } from "../redux/slices/userSlice";
import { EndpointProps } from "../interfaces";
import { EndpointsType } from "../types";

const initialState = { id: "", name: "", route: "", method: "" } as EndpointProps

interface Props { id: string | undefined }

const CollapsibleTable:React.FC<Props> = ({id}) => {
  const { inputs, bind, select } = useFormInputs(initialState)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const { name, route, method } = inputs
  const dispatch = useAppDispatch()
  const classes = useStyles()
  const { userApis } = useAppSelector(store => store.user)
  
  const openEditing = (index: number) => {
    setIsEditing(index)
  }

  const save = (id: string | undefined) => {
    const payload = {id, name, method, route}
    dispatch(editEndpoint(payload))
    setIsEditing(null)
  }
  
  const deleteRoute = (id: string | undefined) => {
    dispatch(removeEndpoint(id))
  }

  return (
    <>
    <TableContainer component={Paper} >
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Route</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userApis?.map((api) => (
            api?.endpoints?.map((endpoint, index) => (
            <TableRow key={index}>
              <TableCell>
                <input type="text" name="name" defaultValue={endpoint?.name} {...bind} className={classes.input} disabled={isEditing !== index} />
              </TableCell>
              <TableCell>
                <select name="method" defaultValue={endpoint?.method} {...select} className={classes.input} disabled={isEditing !== index}>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </TableCell>
              <TableCell>
                <input type="text" name="route" defaultValue={endpoint?.route.toString()} {...bind} className={classes.input} disabled={isEditing !== index} />
              </TableCell>
              <TableCell>
                {isEditing === index ? (
                  <button onClick={() => save(endpoint?.id)} className={classes.button} style={{background: "#081F4A"}}>
                    DONE
                  </button>
                ) : (
                  <button onClick={() => openEditing(index)} className={classes.button} style={{background: "#081F4A"}}>
                    EDIT
                  </button>
                )}
              </TableCell>
              <TableCell>
                <button onClick={() => deleteRoute(endpoint?.id)} className={classes.button} style={{background: "#E32C08"}}>
                  DELETE
                </button>
              </TableCell>
            </TableRow>))
          ))}
          {/* {endpoints?.map((item, index) => (
          ))} */}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
}

const useStyles = makeStyles({
  form: {
    display: "flex",
    alignItems: "center",
    padding: "0 1rem",
    gap: "1rem",
  },
  input: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "40px",
    borderRadius: "4px",
    border: "1px solid #999",
    outline: "none",
    padding: "0 0.5rem",
    fontWeight: 400,
    fontSize: "14px",
    lineHeight: "24px",
    fontFamily: "var(--body-font)",
    transition: "0.5s all ease-in-out cubic-bezier(0.075, 0.82, 0.165, 1)",
    "&:disabled": {
      border: "none",
      background: "#FFF",
      color: "#000",
    }
  },
  button: {
    padding: "0.5rem 1rem",
    border: "none",
    outline: "none",
    borderRadius: "5px",
    color: "#FFF",
    cursor: "pointer",
    fontFamily: "var(--body-font)",
  }
})

export default CollapsibleTable