
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../config/constant";


function Body(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/profile`,{withCredentials:true});
      if (res.status === 200) {
        dispatch(setUser(res.data));
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/");
      }
      // Do nothing (Silently handle the error)
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div>
      <Navbar {...props}/>
      <Outlet />
    </div>
  );
}

export default Body;
