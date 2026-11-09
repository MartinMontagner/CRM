import { ChatStatus } from "@/types/types";

export const getSvgFilled = (type: ChatStatus) => {
  let fill;

  switch (type) {
    case ChatStatus.ANSWERED:
      fill = "#27AE60";
      break;
    case ChatStatus.UNREAD:
      fill = "#DFDFDF";
      break;
    case ChatStatus.READ:
      fill = "#202D38";
      break;
    default:
      fill = "#DFDFDF";
  }

  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10.5" cy="10.5" r="10.5" fill={fill} />
      <path
        d="M10.9712 15.7266V14.2467C8.16027 14.5162 5.78848 12.5072 5.78848 10.029C5.78848 7.69062 7.90208 5.78857 10.5 5.78857C13.098 5.78857 15.2116 7.69062 15.2116 10.029C15.2116 10.1802 15.2017 10.3296 15.1852 10.4775C14.9039 13.0792 12.2301 14.9186 11.6968 15.2607L10.9712 15.7266Z"
        fill="white"
      />
    </svg>
  );
};
