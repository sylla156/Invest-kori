import { Box, Container } from "@mui/material";
import {
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  GifIcon,
} from "@heroicons/react/24/solid";
import { formatNumberWithLeadingZero } from "../Helpers/FormatMoney";
import BlocTitle from "../Containers/BlocTitle";
import { CustomersSearch } from "../Components/CustomerSeach";
import { selectLogin } from "../Toolkit/Login/LoginSlice";
import { useSelector } from "react-redux";
import Roles from "../Seeds/Roles";
import React, { useContext } from "react";
import CreateModal from "../Components/Modal/CreateModal";
import Investments from "../Components/Investments/Investments";
import { OverViewContext } from "../Context/OverViewContext";
import ApiSession from "../Service/ApiSession";
import OverViewTable from "../Containers/OverViewTable";
import CardGroupes from "../Containers/CardGroupes";
const OverView = () => {
  const [Loader, setLoader] = React.useState(true);
  const [investState, setInvestState] = React.useState(false);
  const [information, setInformation] = React.useState([]);
  const [card, setCard] = React.useState([
    {
      title: "Number of investments",
      value: formatNumberWithLeadingZero(),
      Icon: <ArrowTrendingUpIcon />,
      color: "primary.main",
      state: Loader,
    },
    {
      title: "Total investment amount",
      value: formatNumberWithLeadingZero(),
      Icon: <CurrencyDollarIcon />,
      color: "warning.main",
      state: Loader,
    },
    {
      title: "Total interest-free investment",
      value: formatNumberWithLeadingZero(),
      Icon: <BanknotesIcon />,
      color: "info.main",
      state: Loader,
    },
    {
      title: "total interest of all",
      value: formatNumberWithLeadingZero(),
      Icon: <GifIcon />,
      color: "error.main",
      state: Loader,
    },
  ]);
  const { user } = useSelector(selectLogin);
  const title = ["Manage Your Investments", "All Investments"];

  const handleInvestment = () => {
    setInvestState(true);
  };

  React.useEffect(() => {
    if (information?.length >= 1) {
      setCard([
        {
          title: "Number of investments",
          value: formatNumberWithLeadingZero(information.length),
          Icon: <ArrowTrendingUpIcon />,
          color: "primary.main",
          state: Loader,
        },
        {
          title: "Total investment amount",
          value: formatNumberWithLeadingZero(
            information
              ?.map((item: any) => item?.amount)
              .reduce(
                (accumulator: any, current: any) => accumulator + current,
                0
              )
          ),
          Icon: <CurrencyDollarIcon />,
          color: "warning.main",
          state: Loader,
        },
        {
          title: "Total investment with interest,",
          value: formatNumberWithLeadingZero(
            information
              ?.map((item: any) => item?.amount + item?.gain)
              ?.reduce(
                (accumulator: any, current: any) => accumulator + current,
                0
              )
          ),
          Icon: <BanknotesIcon />,
          color: "info.main",
          state: Loader,
        },
        {
          title: "Total change in investment",
          value: formatNumberWithLeadingZero(
            information
              .map((item: any) => item?.ChangeRequest?.length)
              .reduce(
                (accumulator: any, current: any) => accumulator + current,
                0
              )
          ),
          Icon: <GifIcon />,
          color: "error.main",
          state: Loader,
        },
      ]);
    }
  }, [Loader, information]);

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
      }}
    >
      <OverViewContext.Provider
        value={{
          state: Loader,
          handle: setLoader,
          information: setInformation,
        }}
      >
        <GetData />
        <Container maxWidth="xl">
          <BlocTitle
            title={user.role !== Roles.lender ? title[1] : title[0]}
            buttonContent={"invest now"}
            disabled={user.role !== Roles.lender}
            handleClick={handleInvestment}
          />
          <CardGroupes CardItemInfo={card} />
          <CustomersSearch />
          <OverViewTable information={information} />
        </Container>
        {investState && (
          <CreateModal
            makeOpen
            ModalContent={Investments}
            closeButton
            closeButtonFunc={() => setInvestState(false)}
            style={{ borderRadius: "0px" }}
          />
        )}
      </OverViewContext.Provider>
    </Box>
  );
};

const GetData = () => {
  const { user } = useSelector(selectLogin);
  const OverViewContextValue = useContext(OverViewContext);
  const state = OverViewContextValue ? OverViewContextValue.state : false;
  const handleLoader = OverViewContextValue
    ? OverViewContextValue.handle
    : false;
  const handleInformation = OverViewContextValue
    ? OverViewContextValue.information
    : false;

  const handleGetInformation = React.useCallback(async () => {
    const response = await ApiSession.invest.list(user.id);
    if (!response.error && handleInformation) handleInformation(response.data);
    if (handleLoader) handleLoader(false);
  }, [handleInformation, handleLoader, user.id]);

  React.useEffect(() => {
    if (state) {
      handleGetInformation();
    }
  }, [handleGetInformation, state]);
  return <></>;
};

export default OverView;
