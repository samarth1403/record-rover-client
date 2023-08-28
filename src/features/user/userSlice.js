import { createSlice, createAsyncThunk, createAction } from "@reduxjs/toolkit";
import userService from "./userService";
import { toast } from "react-toastify";

const getUserFromLocalStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

const getToken =
  getUserFromLocalStorage?.Token !== null ? getUserFromLocalStorage?.Token : "";

const initialState = {
  user: getUserFromLocalStorage,
  Token: getToken,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
  res: {},
  cameraAccess: false,
  audioAccess: false,
  cameraStream: null,
};

export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, thunkAPI) => {
    try {
      return await userService.registerUser(userData);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (data, thunkAPI) => {
    try {
      return await userService.loginUser(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const getUser = createAsyncThunk("user/get", async (data, thunkAPI) => {
  try {
    return await userService.getUser(data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const updateUserProfile = createAsyncThunk(
  "user/update-user-profile",
  async (data, thunkAPI) => {
    try {
      return await userService.updateUserProfile(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const logoutUser = createAction("logout/user");
export const giveCameraAccess = createAction("camera/access");
export const giveAudioAccess = createAction("audio/access");
export const setCameraStream = createAction("camera/stream");

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.registeredUser = action.payload?.registeredUser;
      state.res = action.payload?.res;
      if (state.res?.success && state.isSuccess && state.registeredUser) {
        toast.info("Registered Successfully, Please Login");
      }
      if (state.res?.success === false && state.res?.message !== "") {
        toast.error("User is Already Registered with this Email ID");
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
      if (state.isError) {
        toast.error(action.error);
      }
    });

    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.userData = action.payload?.userData;
      state.user = action.payload?.userData;
      state.Token = action.payload?.userData?.Token;
      state.res = action.payload?.res;
      if (state.res?.success && state.isSuccess && state.userData) {
        localStorage.setItem("user", JSON.stringify(action.payload?.userData));
        toast.success(`Welcome ${action.payload?.userData?.name}`);
      }
      if (state.res?.success === false && state.res?.message !== "") {
        state.user = null;
        toast.error("Invalid Credentials");
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
      if (state.isError) {
        toast.error(action.error);
      }
    });

    builder.addCase(getUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.gotUser = action.payload?.gotUser;
      state.res = action.payload?.res;
    });
    builder.addCase(getUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = true;
      state.message = action.error;
      state.res = null;
    });

    builder.addCase(updateUserProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.isError = false;
      state.updatedUser = action.payload?.updatedUser;
      state.res = action.payload?.res;
      let currentData = JSON.parse(localStorage.getItem("user"));
      let updatedData = {
        _id: currentData?._id,
        Token: currentData?.Token,
        name: action.payload?.updatedUser?.name,
        email: action.payload?.updatedUser?.email,
        mobile: action.payload?.updatedUser?.mobile,
      };
      localStorage.setItem("user", JSON.stringify(updatedData));
      state.user = updatedData;

      if (state.updatedUser && state.res.success) {
        toast.success("Profile Updated Successfully");
      }
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.isSuccess = false;
      state.message = action.error;
      if (state.isError) {
        toast.error("Something Went Wrong");
      }
    });

    builder.addCase(logoutUser, (state, action) => {
      state.Token = null;
    });

    builder.addCase(giveCameraAccess, (state,action) => {
      state.cameraAccess = action.payload;
    });

    builder.addCase(giveAudioAccess, (state,action) => {
      state.audioAccess = action.payload;
    });

    builder.addCase(setCameraStream, (state,action) => {
      state.cameraStream = action.payload;
    });
  },
});

export const userReducer = userSlice.reducer;
