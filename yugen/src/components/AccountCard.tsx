import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { useAuth } from "../contexts/AuthContext";
import tempPFP from "../YugenAssits/Avatar_Placeholder.png";

const AccountCard = ({ account }: any) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl bg-emerald-50 border-2 border-emerald-950 shadow-md text-md cursor-pointer 
                 flex flex-col items-center p-2 w-[200px] h-[160px] transition-transform hover:scale-[1.02] overflow-hidden m-4"
      onClick={() => {
        if (userInfo?.username === account?.username) {
          navigate(`/profile`);
        } else {
          navigate(`/@?username=${encodeURIComponent(account?.username)}`);
        }
      }}
    >
      <img
        src={
          account?.pfp_path
            ? `https://pfps.try-yugen.com/${account.pfp_path}?t=${Date.now()}`
            : tempPFP
        }
        alt={account?.username}
        className="w-16 h-16 rounded-full border-2 border-emerald-950 object-cover mb-1"
      />

      <h3 className="font-freckle text-xs text-emerald-950 truncate w-full text-center">
        @{account?.username}
      </h3>

      <div className="flex justify-center items-center gap-2 text-emerald-950 text-[10px] my-1 w-full">
        <div className="flex items-center gap-1">
          <VideocamOutlinedIcon className="text-emerald-950 text-[12px]" />
          <span>{account?.films_count ?? 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <GroupOutlinedIcon className="text-emerald-950 text-[12px]" />
          <span>{account?.sub_count ?? 0}</span>
        </div>
      </div>

      {account?.bio && (
        <div className="flex items-center justify-center w-full gap-1">
          <p className="font-freckle text-emerald-950 text-[10px] truncate w-[70%]">
            {account?.bio.slice(0, 30)}
            {account?.bio.length > 30 ? "..." : ""}
          </p>
          <button
            className="font-freckle text-emerald-950 underline text-[10px] flex-shrink-0 cursor-auto hover:cursor-auto"
            onClick={(e) => {
              e.stopPropagation();
              if (userInfo?.username === account?.username) {
                navigate("/profile?tab=info");
              } else {
                navigate(
                  `/@?username=${encodeURIComponent(
                    account?.username,
                  )}&tab=info`,
                );
              }
            }}
          >
            more
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountCard;
