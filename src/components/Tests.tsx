import React, { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { Add, ContentCopy, Delete, Edit, MoreVert, PlayArrow } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import Cookies from "universal-cookie";
import { toast } from "react-toastify";

import { APIType, EndpointsType, OptionsType, TestType } from "../types";
import { useFormInputs, useHttpRequest } from "../hooks";
import { ids } from "webpack";

interface Props {
    id: string | undefined
}

const colors: any = {
    "run": "#49B443",
    "edit": "#1B5598",
    "delete": "#E64F36",
    "duplicate": "#E6BA36",
}

const testOptions: Array<TestType> = [
    { name: "Run", action: "run", icon: <PlayArrow />},
    { name: "Delete", action: "delete", icon: <Delete /> },
    // { name: "Edit", action: "edit", icon: <Edit /> },
    // { name: "Duplicate", action: "duplicate", icon: <ContentCopy /> },
]

const initialState = { testName: "", endpointName: "", route: "", headerValue: "", bodyValue: "", paramsValue: ""}

const Tests:React.FC<Props> = ({id}) => {
    const [endpoints, setEndpoints] = useState<Array<EndpointsType> | null>([]);
    const [creatingTest, setCreatingTest] = useState<boolean>(false);
    const [testAction, setTestAction] = useState<string>("run");
    const {inputs, bind, select} = useFormInputs(initialState);
    const {error, loading, sendRequest} = useHttpRequest();
    const [api, setApi] = useState<APIType | null>(null);
    const { testName, endpointName, route, headerValue, bodyValue, paramsValue } = inputs
    const cookies = new Cookies();
    const classes= useStyles();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    
    const [headers, setHeaders] = useState<Array<OptionsType>>([])
    const [body, setBody] = useState<Array<OptionsType>>([])
    const [params, setParams] = useState<Array<OptionsType>>([])
    
    const addHeaderValue = (object: OptionsType) => {
        const { name, value } = object;
        if (!value) return toast.error("Add a valid value");
        if(headers.find((obj) => obj.name.toLowerCase() === name.toLowerCase())) return toast.error("Duplicate values!");
        setHeaders(prev => [...prev, object]);
    }

    const addBodyValue = (object: OptionsType) => {
        const { name, value } = object;
        if (!value) return toast.error("Add a valid value");
        if(body.find((obj) => obj.name.toLowerCase() === name.toLowerCase())) return toast.error("Duplicate values!");
        setBody(prev => [...prev, object]);
    }

    const addParamsValue = (object: OptionsType) => {
        const { name, value } = object;
        if (!value) return toast.error("Add a valid value");
        if(params.find((obj) => obj.name.toLowerCase() === name.toLowerCase())) return toast.error("Duplicate values!");
        setParams(prev => [...prev, object]);
    }

    const fetchApiData = async(apiId: string | undefined): Promise<any> => {
        const headers = {
            'Content-Type': "application/json",
            'X-Zapi-Auth-Token': `Bearer ${cookies.get("accessToken")}`
        };
        try {
            const apiData = await sendRequest(`/api/findOne/${apiId}`, "get", "VITE_CORE_URL", {}, headers);
            const endpointsData = await sendRequest(`/endpoints/${apiId}`, "get", "VITE_CORE_URL", {}, headers);

            const [api, endpoints] = await Promise.all([apiData, endpointsData]);
            if(api === undefined || endpoints === undefined) return
            setApi(api.data);
            setEndpoints(endpoints.data);
        } catch (error) {}
    };

    const addTest = async(e: FormEvent) => {
        e.preventDefault()
        if(!testName) return toast.error("Test name cannot be empty")
        const requestHeaders = {
            'Content-type': "application/json",
            'X-Zapi-Auth-Token': `Bearer ${cookies.get("accessToken")}`
        };
        const payload = {
            apiId: id,
            profileId: cookies.get("profileId"),
            testName,
            route,
            payload: {
                headers,
                body,
                params,
            }
        }
        console.log(payload)
        try {
            // const data = await sendRequest(``, "get", "VITE_CORE_URL", payload, requestHeaders)
            // if(data === undefined) return
        } catch (error) {}
        setCreatingTest(false)
    };

    const runTestAction = async(action: string) => {
        const headers = {
            'Content-Type': "application/json",
            'X-Zapi-Auth-Token': `Bearer ${cookies.get("accessToken")}`
        };
        const payload = {}
        try {
            // const data = await sendRequest(``, "post", payload, headers)
            console.log(action)
        } catch (error) {
            
        }
    };
    
    useEffect(() => {
        fetchApiData(id)
    },[])

  return (
    <Paper className={classes.paper}>
        <Stack width="100%" direction="row" alignItems="center" justifyContent="space-between" mt={2} mb={4}>
            <Box className={classes.inputs}>
                <input type="text" name="search" placeholder="Search tests" />
            </Box>
            {!creatingTest && (
                <Button onClick={() => setCreatingTest(true)} className={classes.button}>
                    Create Test
                </Button>
            )}
        </Stack>
        {creatingTest && (
            <form onSubmit={addTest} style={{margin: "0 0 2rem"}}>
                <Stack width="100%" direction="row" alignItems="center" spacing={2} my={2}>
                    <Box className={classes.inputs}>
                        <input type="text" name="testName" {...bind} placeholder="Test name" />
                    </Box>
                    <Box className={classes.inputs}>
                        <button type="submit" disabled={!endpointName}>add</button>
                    </Box>
                    <Box className={classes.inputs}>
                        <button type="button" onClick={() => setCreatingTest(false)} style={{background: colors["delete"]}}>cancel</button>
                    </Box>
                </Stack>
                {testName && endpoints && (
                    <Stack width="100%" direction="row" alignItems="center" spacing={2} my={2}>
                        <Box className={classes.inputs}>
                            <label>Endpoint name</label>
                            <select name="endpointName" {...select}>
                                {endpoints.map((endpoint, index) => (
                                    <option key={index} value={endpoint.name}>
                                        {endpoint.name}
                                    </option>
                                ))}
                            </select>
                        </Box>
                        <Box className={classes.inputs}>
                            <label>Endpoint route</label>
                            {endpoints
                            .filter((endpoint) => endpoint.name === endpointName)
                            .map((endpoint, index) => (
                                <input key={index} type="text" value={endpoint.route} name="route" {...bind} disabled />
                            ))}
                        </Box>
                    </Stack>
                )}
                {testName && endpoints && endpoints
                .filter((endpoint) => endpoint.name === endpointName)
                .map((endpoint, index) => (
                    <Stack key={index} width="100%" direction="column" spacing={2} my={1}>
                        <Stack>
                            <Typography sx={{fontSize: "14px",fontWeight: 500,color: "#081F4A"}}>Headers</Typography>
                            {endpoint.headers?.map((header, index) => (
                                <Stack key={index} width="100%" direction="row" alignItems="center" spacing={2} my={1}>
                                    <Typography sx={{fontSize: "13px",color: "#081F4A"}}>
                                        {header.name}
                                    </Typography>
                                    <input type="text" name="headerValue" {...bind} required={header.required} className={classes.input} />
                                    <IconButton type="button" onClick={() => addHeaderValue({name: header.name, value: headerValue})}>
                                        <Add />
                                    </IconButton>
                                </Stack>
                            ))}
                        </Stack>
                        <Stack>
                            <Typography sx={{fontSize: "14px",fontWeight: 500,color: "#081F4A"}}>Body</Typography>
                            {endpoint.body?.map((key, index) => (
                                <Stack key={index} width="100%" direction="row" alignItems="center" spacing={2} my={1}>
                                    <Typography sx={{fontSize: "13px",color: "#081F4A"}}>
                                        {key.name}
                                    </Typography>
                                    <input type="text" name="bodyValue" {...bind} required={key.required} className={classes.input} />
                                    <IconButton type="button" onClick={() => addBodyValue({name: key.name, value: bodyValue})}>
                                        <Add />
                                    </IconButton>
                                </Stack>
                            ))}
                        </Stack>
                        <Stack>
                            <Typography sx={{fontSize: "14px",fontWeight: 500,color: "#081F4A"}}>Query Params</Typography>
                            {endpoint.query?.map((param, index) => (
                                <Stack key={index} width="100%" direction="row" alignItems="center" spacing={2} my={1}>
                                    <Typography sx={{fontSize: "13px",color: "#081F4A"}}>
                                        {param.name}
                                    </Typography>
                                    <input type="text" name="paramsValue" {...bind} required={param.required} className={classes.input} />
                                    <IconButton type="button" onClick={() => addParamsValue({name: param.name, value: paramsValue})}>
                                        <Add />
                                    </IconButton>
                                </Stack>
                            ))}
                        </Stack>
                    </Stack>
                ))}
            </form>
        )}
        <Table>
            <TableHead className={classes.head}>
                <TableRow>
                    <TableCell className={classes.cell}>Name</TableCell>
                    <TableCell className={classes.cell}>Endpoint</TableCell>
                    <TableCell className={classes.cell}>Route</TableCell>
                    <TableCell className={classes.cell}>Time</TableCell>
                    {/* <TableCell className={classes.cell}>Status</TableCell> */}
                    <TableCell className={classes.cell}>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    <TableCell>Test name</TableCell>
                    <TableCell>Endpoint</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Time</TableCell>
                    {/* <TableCell>Status</TableCell> */}
                    <TableCell sx={{display: "flex",alignItems: "center",gap: "1rem"}}>
                        <>
                        <IconButton onClick={handleClick}>
                            <MoreVert />
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                            <MenuItem onClick={handleClose}>
                                <Button onClick={() => console.log("run")} style={{background: colors["run"],color: "#FFF"}}>
                                    run
                                </Button>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <Button onClick={() => console.log("delete")} style={{background: colors["delete"],color: "#FFF"}}>
                                    delete
                                </Button>
                            </MenuItem>
                        </Menu>
                        </>

                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    </Paper>
  )
};

const useStyles = makeStyles({
    paper: {
        padding: "1rem 0.5rem",
    },
    inputs: {
        width: "max-content",
        display: "flex",
        flexDirection: "column",
        fontSize: "14px",
        lineHeight: "24px",
        fontFamily: "var(--body-font)",
        "& label": {
            color: "#081F4A",
            fontSize: "14px",
            fontWeight: 500,
            lineHeight: 1,
        },
        "& input": {
          width: "100%",
          height: "40px",
          padding: "0 0.5rem",
          borderRadius: "4px",
          border: "1px solid #999",
          outline: "none",
        },
        "& select": {
            minWidth: "70px",
            height: "40px",
            borderRadius: "4px",
            border: "1px solid #999",
            outline: "none",
          },
          "& textarea": {
            resize: "none",
            width: "300px",
            height: "100px",
            borderRadius: "4px",
            border: "1px solid #999",
            outline: "none",
            padding: "0.5rem",
          },
          "& button": {
            width: "75px",
            height: "40px",
            background: "#49B443",
            color: "#FFF",
            border: "none",
            borderRadius: "4px",
            textTransform: "uppercase",
            fontSize: "12px",
            "&:disabled": {
                background: "#E0E0E0",
                color: "#484848",
                cursor: "not-allowed",
            },
            "& svg": {
                fontSize: "1.2rem"
            }
          },
          "& input[type=checkbox]": {
            width: "15px",
            height: "15px",
          },
    },
    button: {
        "&.MuiButtonBase-root": {
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            background: "#081F4A",
            color: "#FFF",
            padding: "3px 12px",
            borderRadius: "5px",
            border: "none",
            outline: "none",
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "uppercase",
            fontFamily: "var(--body-font)",
            cursor: "pointer",
            "&:hover": {
                background: "#081F4A",
            },
            "&:disabled": {
              background: "#E0E0E0",
              color: "#484848",
            },
        }
    },
    head: {
        "&.MuiTableHead-root": {
            background: "#081F4A",
        },
    },
    cell: {
        "&.MuiTableCell-root": {
            width: "150px",
            color: "#FFF",
            fontWeight: 500,
            fontSize: "16px",
        }
    },
    input: {
        width: "150px",
        height: "25px",
        padding: "0 0.25rem",
        borderRadius: "4px",
        border: "1px solid #999",
        outline: "none",
    }
});

export default Tests