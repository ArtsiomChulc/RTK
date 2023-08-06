import React, { useState } from "react";
import { FormikHelpers, useFormik } from "formik";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "common/hooks/useAppDispatch";
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, TextField } from "@mui/material";
import { selectIsLoggedIn } from "features/Login/auth.selector";
import { authThunk } from "features/Login/auth-reducer";
import { LoginParamsType } from "features/Login/auth.api";
import s from "./login.module.css";
import { ResponseType } from "common/types";
import eye from "../../common/icons/eye.svg";

type FormikErrorType = {
    email?: string;
    password?: string;
};

export const Login = () => {
    const dispatch = useAppDispatch();
    const [showPassword, setShowPassword] = useState(false);
    const [isFormEmpty, setIsFormEmpty] = useState(true);

    // const isLoggedIn = useSelector<AppRootStateType, boolean>((state) => state.auth.isLoggedIn);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const formik = useFormik({
        validate: (values) => {
            const errors: FormikErrorType = {};
            if (!values.email) {
                errors.email = "Email is required";
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
                errors.email = "Invalid email address";
            }
            if (!values.password) {
                errors.password = "Password is required";
            } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/i.test(values.password)) {
                errors.password = "Incorrect password";
            }
            return errors;
        },
        initialValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
        onSubmit: (values, formikHelpers: FormikHelpers<LoginParamsType>) => {
            dispatch(authThunk.login(values))
                .unwrap()
                .catch((reason: ResponseType) => {
                    reason.fieldsErrors?.forEach((fieldError) => {
                        formikHelpers.setFieldError(fieldError.field, fieldError.error);
                    });
                });
        },
    });

    const changeShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleFormChange = () => {
        setIsFormEmpty(Object.values(formik.values).every((value) => value === ""));
    };

    if (isLoggedIn) {
        return <Navigate to={"/"} />;
    }

    return (
        <Grid container justifyContent="center">
            <Grid item xs={4}>
                <form onSubmit={formik.handleSubmit} onChange={handleFormChange}>
                    <FormControl>
                        <FormLabel>
                            <p>
                                To log in get registered{" "}
                                <a href={"https://social-network.samuraijs.com/"} target={"_blank"}>
                                    here
                                </a>
                            </p>
                            <p>or use common test account credentials:</p>
                            <p> Email: free@samuraijs.com</p>
                            <p>Password: free</p>
                        </FormLabel>
                        <FormGroup>
                            <TextField label="Email" margin="normal" {...formik.getFieldProps("email")} />
                            {formik.errors.email ? <div className={s.fieldError}>{formik.errors.email}</div> : null}
                            <TextField
                                className={s.passwordField}
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                margin="normal"
                                {...formik.getFieldProps("password")}
                            />
                            <img onClick={changeShowPassword} className={s.eyePassword} src={eye} alt="" />
                            {formik.errors.password ? (
                                <div className={s.fieldError}>{formik.errors.password}</div>
                            ) : null}
                            <FormControlLabel
                                label={"Remember me"}
                                control={
                                    <Checkbox
                                        {...formik.getFieldProps("rememberMe")}
                                        checked={formik.values.rememberMe}
                                    />
                                }
                            />
                            <Button disabled={isFormEmpty} type={"submit"} variant={"contained"} color={"primary"}>
                                Login
                            </Button>
                        </FormGroup>
                    </FormControl>
                </form>
            </Grid>
        </Grid>
    );
};
