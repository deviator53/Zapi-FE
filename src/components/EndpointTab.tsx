import React, { FormEvent, useEffect, useState } from "react";
import { IconButton, Paper, Stack, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { toast } from "react-toastify";
import { Add, Remove } from "@mui/icons-material";
import Cookies from "universal-cookie";

import { useAppDispatch, useFormInputs, useHttpRequest } from "../hooks";
import { addEndpoint, getUserApis } from "../redux/slices/userSlice";
import EndpointTable from "./EndpointTable";
import { OptionsType } from "../types";
import { Spinner } from "../assets";
import ReactGA from "react-ga4";

const core_url = "VITE_CORE_URL";
const initialState = {
  name: "",
  route: "",
  method: "get",
  description: "",
  headers: "",
  headerType: "string",
  headerIsRequired: false,
  requestBody: "",
  requestBodyType: "string",
  requestBodyFormat: "application/json",
  requestBodyIsRequired: false,
  queryParams: "",
  queryParamType: "string",
  queryParamIsRequired: false,
};
interface Props {
  id: string | undefined;
}

const EndpointTab: React.FC<Props> = ({ id }) => {
  const { inputs, bind, select, toggle } = useFormInputs(initialState);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(false);
  const { error, loading, sendRequest } = useHttpRequest();
  const {
    name,
    route,
    method,
    description,
    headers,
    headerType,
    headerIsRequired,
    requestBody,
    requestBodyType,
    requestBodyFormat,
    requestBodyIsRequired,
    queryParams,
    queryParamType,
    queryParamIsRequired,
  } = inputs;
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const cookies = new Cookies();
  const profileId = cookies.get("profileId");

  const [headersArray, setHeadersArray] = useState<Array<OptionsType>>([]);
  const [requestBodyArray, setRequestBodyArray] = useState<Array<OptionsType>>(
    []
  );
  const [queryParamsArray, setQueryParamsArray] = useState<Array<OptionsType>>(
    []
  );

  ReactGA.send({ hitType: "pageview", page: "/endpointTab" });
  
  const addHeaders = (object: OptionsType) => {
    const { name } = object;
    if (!name) return toast.error("Add a valid string");
    if (
      headersArray.find((obj) => obj.name.toLowerCase() === name.toLowerCase())
    )
      return toast.error("Duplicate values");
    setHeadersArray((prevHeaders) => [...prevHeaders, object]);
  };

  const removeHeader = (name: string) =>
    setHeadersArray((current) =>
      current.filter((header) => header.name !== name)
    );

  const addRequestBody = (object: OptionsType) => {
    const { name } = object;
    if (!name) return toast.error("Add a valid string");
    if (
      requestBodyArray.find(
        (obj) => obj.name.toLowerCase() === name.toLowerCase()
      )
    )
      return toast.error("Duplicate values");
    setRequestBodyArray((reqBody) => [...reqBody, object]);
  };

  const removeRequestBody = (name: string) =>
    setRequestBodyArray((current) =>
      current.filter((reqBody) => reqBody.name !== name)
    );

  const addQueryParams = (object: OptionsType) => {
    const { name } = object;
    if (!name) return toast.error("Add a valid string");
    if (
      queryParamsArray.find(
        (obj) => obj.name.toLowerCase() === name.toLowerCase()
      )
    )
      return toast.error("Duplicate values");
    setQueryParamsArray((param) => [...param, object]);
  };

  const removeQueryParams = (name: string) =>
    setQueryParamsArray((current) =>
      current.filter((param) => param.name !== name)
    );

  const toggleAdding = () => {
    setHeadersArray([]);
    setRequestBodyArray([]);
    setQueryParamsArray([]);
    setIsAdding((prev) => !prev);
  };
  const toggleOptions = () => setIsOptionsOpen((prev) => !prev);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !route) return toast.error("Please add a name and route");
    const payload = {
      name,
      route,
      method,
      description,
      headers: headersArray,
      body: requestBodyArray,
      query: queryParamsArray,
    };
    const headers = { "Content-Type": "application/json" };
    try {
      const data = await sendRequest(
        `/endpoints/new/${id}`,
        "post",
        core_url,
        payload,
        headers
      );
      if (!data || data === undefined) return;
      dispatch(addEndpoint(payload));
      const { message } = data;
      toast.success(`${message}`);
    } catch (error) {}
    setIsAdding(false);
    setHeadersArray([]);
    setRequestBodyArray([]);
    setQueryParamsArray([]);
    dispatch(getUserApis(profileId));
  };

  useEffect(() => {
    error && toast.error(`${error.message}`);
  }, [error]);

  useEffect(() => {
    method === "" && setIsOptionsOpen(false)
  },[method])

  return (
    <Paper className={classes.paper}>
      <Stack direction="column" mb={8}>
        <div>
          <Typography variant="body1" fontSize="20px" fontWeight={800}>
            API Definition
          </Typography>
        </div>
        <div className={classes.pageSubHeading}>
          <Typography variant="subtitle2" width="auto" fontWeight={400}>
            When publishing an API to the ZapiAPI Hub, you can either manually
            edit endpoint definitions, use a specification file.
          </Typography>
        </div>
        <Typography
          variant="body1"
          fontSize="24px"
          color="#081F4A"
          fontWeight={500}
          mt={2}>
          Endpoints
        </Typography>
        <Typography variant="body1" fontSize="16px" fontWeight={400} mb={1}>
          Changes made to the endpoints will be reflected in the Hub.
        </Typography>
        <div className={classes.pageDescription}>
          <Typography>Add and define your API endpoints.</Typography>
        </div>
        {/* Add Endpoint */}
        <div className={classes.pageActions}>
          <div className={classes.inputs}>
            <input type="text" name="search" placeholder="Search..." />
          </div>
          <div>
            <button
              onClick={toggleAdding}
              className={classes.button}
              style={{ background: isAdding ? "#c5c5c5" : "#081F4A" }}>
              {isAdding ? "Cancel" : "Add Endpoint"}
            </button>
          </div>
        </div>
      </Stack>
      {isAdding && (
        <form onSubmit={handleSubmit}>
          <Stack direction="row" width="100%" alignItems="center" justifyContent="space-between" my={1}>
            <Typography>Add Endpoint</Typography>
            <button
              type="submit"
              className={classes.button}
              style={{ background: "#10c96b" }}>
              {loading ? <Spinner /> : "ADD"}
            </button>
          </Stack>
          <Stack direction="column" spacing={1} mt={4} mb={1}>
            <div className={classes.inputs}>
              <input type="text" name="name" {...bind} placeholder="Name" />
            </div>
            <div className={classes.inputs}>
              <textarea
                name="description"
                {...bind}
                placeholder="Description"
              />
            </div>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2} my={1}>
            <div className={classes.inputs}>
              <select name="method" {...select}>
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="patch">PATCH</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
            <div className={classes.inputs}>
              <input type="text" name="route" {...bind} placeholder="Route" />
            </div>
            <IconButton onClick={toggleOptions} disabled={method === "post"} title="Toggle Params">
              {isOptionsOpen ? <Remove /> : <Add />}
            </IconButton>
          </Stack>
          {(isOptionsOpen || method === "post") && (
            <>
              <Stack direction="column" spacing={1}>
                <Stack direction="row" spacing={2}>
                  <div className={classes.inputs}>
                    <input
                      type="text"
                      name="headers"
                      {...bind}
                      placeholder="Headers"
                    />
                  </div>
                  <div className={classes.inputs}>
                    <select name="headerType" {...select}>
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="file">File</option>
                      <option value="boolean">Boolean</option>
                      <option value="object">Object</option>
                      <option value="array">Array</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>                      
                      <option value="enum">Enum</option>
                    </select>
                  </div>
                  <div className={classes.inputs}>
                    <input
                      type="checkbox"
                      name="headerIsRequired"
                      {...toggle}
                    />
                  </div>
                  <div className={classes.inputs}>
                    <button
                      type="button"
                      onClick={() =>
                        addHeaders({
                          name: headers,
                          type: headerType,
                          required: headerIsRequired,
                        })
                      }>
                      <Add />
                    </button>
                  </div>
                </Stack>
                {method === "post" && (
                  <Stack direction="row" spacing={2}>
                    <div className={classes.inputs}>
                      <input
                        type="text"
                        name="requestBody"
                        {...bind}
                        placeholder="Body"
                      />
                    </div>
                    <div className={classes.inputs}>
                      <select name="requestBodyType" {...select}>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="file">File</option>
                        <option value="boolean">Boolean</option>
                        <option value="object">Object</option>
                        <option value="array">Array</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>              
                        <option value="enum">Enum</option>
                      </select>
                    </div>
                    <div className={classes.inputs}>
                      <select name="requestBodyFormat" {...select}>
                        <option value="application/json">application/json</option>
                        <option value="application/xml">application/xml</option>
                        <option value="application/octet-stream">application/octet-stream</option>
                        <option value="text/plain">text/plain</option>
                        <option value="form-data">form-data</option>
                      </select>
                    </div>
                    <div className={classes.inputs}>
                      <input
                        type="checkbox"
                        name="requestBodyIsRequired"
                        {...toggle}
                      />
                    </div>
                    <div className={classes.inputs}>
                      <button
                        type="button"
                        onClick={() =>
                          addRequestBody({
                            name: requestBody,
                            type: requestBodyType,
                            required: requestBodyIsRequired,
                          })
                        }>
                        <Add />
                      </button>
                    </div>
                  </Stack>
                )}
                <Stack direction="row" spacing={2}>
                  <div className={classes.inputs}>
                    <input
                      type="text"
                      name="queryParams"
                      {...bind}
                      placeholder="Query"
                    />
                  </div>
                  <div className={classes.inputs}>
                    <select name="queryParamType" {...select}>
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="file">File</option>
                      <option value="boolean">Boolean</option>
                      <option value="object">Object</option>
                      <option value="array">Array</option>
                      <option value="date">Date</option>
                      <option value="time">Time</option>         
                      <option value="enum">Enum</option>
                    </select>
                  </div>
                  <div className={classes.inputs}>
                    <input
                      type="checkbox"
                      name="queryParamIsRequired"
                      {...toggle}
                    />
                  </div>
                  <div className={classes.inputs}>
                    <button
                      type="button"
                      onClick={() =>
                        addQueryParams({
                          name: queryParams,
                          type: queryParamType,
                          required: queryParamIsRequired,
                        })
                      }>
                      <Add />
                    </button>
                  </div>
                </Stack>
              </Stack>
            </>
          )}
        </form>
      )}
      {isAdding && (isOptionsOpen || method === "post") && (
        <Stack direction="column" spacing={1} my={2}>
          <ul className={classes.list}>
            Headers:{" "}
            {headersArray.length > 0 &&
              headersArray.map((header, index) => (
                <li key={index}>
                  {header.name}: {header.type}{" "}
                  <button onClick={() => removeHeader(header.name)}>
                    <Remove />
                  </button>
                </li>
              ))}
          </ul>
          <ul className={classes.list}>
            Request Body:{" "}
            {requestBodyArray.length > 0 &&
              requestBodyArray.map((req, index) => (
                <li key={index}>
                  {req.name}: {req.type}{" "}
                  <button onClick={() => removeRequestBody(req.name)}>
                    <Remove />
                  </button>
                </li>
              ))}
          </ul>
          <ul className={classes.list}>
            Query Params:{" "}
            {queryParamsArray.length > 0 &&
              queryParamsArray.map((param, index) => (
                <li key={index}>
                  {param.name}: {param.type}{" "}
                  <button onClick={() => removeQueryParams(param.name)}>
                    <Remove />
                  </button>
                </li>
              ))}
          </ul>
        </Stack>
      )}
      <EndpointTable id={`${id}`} />
    </Paper>
  );
};

export default EndpointTab;

const useStyles = makeStyles({
  paper: {
    width: "100%",
    minWidth: "890px",
    marginTop: "20px",
    padding: "2rem",
    marginBottom: "2rem",
  },
  pageSubHeading: {
    paddingBottom: "1rem",
  },
  pageDescription: {
    paddingBottom: "1rem",
  },
  pageActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputs: {
    width: "max-content",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    lineHeight: "24px",
    fontFamily: "var(--body-font)",
    "& input": {
      width: "100%",
      height: "40px",
      padding: "0 0.5rem",
      borderRadius: "4px",
      border: "1px solid #999",
      outline: "none",
    },
    "& select": {
      minWidth: "100px",
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
      width: "60px",
      height: "40px",
      background: "#081F4A",
      color: "#FFF",
      border: "none",
      borderRadius: "4px",
    },
    "& input[type=checkbox]": {
      width: "15px",
      height: "15px",
    },
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    color: "#FFF",
    padding: "6px 16px",
    borderRadius: "5px",
    border: "none",
    outline: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: "uppercase",
    fontFamily: "var(--body-font)",
    transition: "0.5s all ease-in-out cubic-bezier(0.075, 0.82, 0.165, 1)",
    cursor: "pointer",
    "& disabled": {
      background: "#E0E0E0",
      color: "#484848",
    },
  },
  list: {
    display: "flex",
    gap: "0.5rem",
    listStyle: "none",
    color: "#081F4A",
    fontSize: "14px",
    "& li": {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      background: "#C4C4C4",
      color: "#081F4A",
      padding: "1px 3px",
      borderRadius: "2px",
    },
    "& button": {
      width: "",
      height: "15px",
      background: "#C4C4C4",
      color: "#081F4A",
      border: "none",
      padding: 0,
      "& svg": {
        fontSize: "0.75rem",
      },
    },
  },
});
