import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  balance: 0,
  loan: 0,
  loanPurpose: "",
  isLoading: false,
};

// create async thunk
export const convertAmount = createAsyncThunk(
  "account/convertAmount",
  async (payload) => {
    const { amount, currency } = payload;
    if (currency === "USD") return amount;

    const res = await fetch(
      `https://api.frankfurter.app/latest?base=${currency}&symbols=USD`
    );

    const data = await res.json();

    const convertedAmount = (amount * data.rates?.USD).toFixed(2);

    return convertedAmount;
  }
);

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    deposit(state, action) {
      if (action.payload > 0) {
        state.balance += action.payload;
        state.isLoading = false;
      }
    },
    withdraw(state, action) {
      if (action.payload > 0 && state.balance >= action.payload) {
        state.balance -= action.payload;
      }
    },
    requestLoan: {
      prepare(amount, purpose) {
        return {
          payload: { amount, purpose },
        };
      },
      reducer(state, action) {
        if (state.loan === 0 && action.payload.amount > 0) {
          state.loan = action.payload.amount;
          state.loanPurpose = action.payload.purpose;
          state.balance += action.payload.amount;
          state.isLoading = false;
        }
      },
    },
    payLoan(state) {
      if (state.loan > 0) {
        state.loanPurpose = "";
        state.balance -= state.loan;
        state.loan = 0;
        state.isLoading = false;
      }
    },
    convertingCurrency(state) {
      state.isLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(convertAmount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(convertAmount.fulfilled, (state, action) => {
        state.balance += action.payload;
        state.isLoading = false;
      })
      .addCase(convertAmount.rejected, (state) => {
        state.error = action.error.message;
        state.isLoading = false;
      });
  },
});

export const { deposit, withdraw, requestLoan, payLoan } = accountSlice.actions;

export default accountSlice.reducer;

// export function deposit(amount, currency) {
//   if (currency === "USD") return { type: "account/deposit", payload: amount };

//   return async function (dispatch, getState) {
//     dispatch({ type: "account/convertingCurrency" });
//     //API CALL

//     const res = await fetch(
//       `https://api.frankfurter.app/latest?base=${currency}&symbols=USD`
//     );

//     const data = await res.json();

//     const convertedAmount = (amount * data.rates?.USD).toFixed(2);

//     //RETURN ACTION
//     dispatch({ type: "account/deposit", payload: convertedAmount });
//   };
// }
/*
export default function accountReducer(state = initialStateAccount, action) {
  switch (action.type) {
    case "account/deposit":
      return {
        ...state,
        balance: state.balance + action.payload,
        isLoading: false,
      };
    case "account/withdraw":
      return { ...state, balance: state.balance - action.payload };
    case "account/requestLoan":
      if (state.loan > 0) return state;
      //LATER
      return {
        ...state,
        loan: action.payload.amount,
        loanPurpose: action.payload.purpose,
        balance: state.balance + action.payload.amount,
      };
    case "account/payLoan":
      return {
        ...state,
        loan: 0,
        loanPurpose: "",
        balance: state.balance - state.loan,
      };
    case "account/convertingCurrency":
      return { ...state, isLoading: true };
    default:
      return state;
  }
}

export function deposit(amount, currency) {
  if (currency === "USD") return { type: "account/deposit", payload: amount };

  return async function (dispatch, getState) {
    dispatch({ type: "account/convertingCurrency" });
    //API CALL

    const res = await fetch(
      `https://api.frankfurter.app/latest?base=${currency}&symbols=USD`
    );

    const data = await res.json();

    const convertedAmount = (amount * data.rates?.USD).toFixed(2);

    //RETURN ACTION
    dispatch({ type: "account/deposit", payload: convertedAmount });
  };
}

export function withdraw(amount) {
  return { type: "account/withdraw", payload: amount };
}

export function requestLoan(amount, purpose) {
  return {
    type: "account/requestLoan",
    payload: {
      amount,
      purpose,
    },
  };
}

export function payLoan() {
  return { type: "account/payLoan" };
}
*/
