// src/L2/AccountCard.tsx
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabaseClient";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import { useAuth } from "../contexts/AuthContext";

const AccountCard = ({ account }: any) => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl bg-emerald-50 border-2 border-emerald-950 shadow-md cursor-pointer 
                 flex flex-col items-center p-4 w-100px h-100px transition-transform hover:scale-[1.02] mb-3"
      onClick={() => {
        if (userInfo?.username === account?.username) {
          navigate("/profile");
        } else {
          navigate(`/@?username=${encodeURIComponent(account?.username)}`);
        }
      }}
    >
      {/* Avatar */}
      <img
        src={
          account?.pfp_path
            ? supabase.storage.from("pfps").getPublicUrl(account.pfp_path).data
                .publicUrl
            : "/default-avatar.png"
        }
        alt={account?.username}
        className="w-24 h-24 rounded-full mb-3 border-2 border-emerald-950 object-cover"
      />

      {/* Username */}
      <h3 className="font-freckle text-xl text-emerald-950 mb-2">
        @{account?.username}
      </h3>

      {/* Stats */}
      <div className="flex items-center gap-4 text-emerald-950 mb-2">
        <div className="flex items-center gap-1">
          <VideocamOutlinedIcon className="text-emerald-950" />
          <span>{account?.films_count ?? 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <GroupOutlinedIcon className="text-emerald-950" />
          <span>{account?.sub_count ?? 0}</span>
        </div>
      </div>

      {/* Bio preview */}
      {account?.bio && (
        <div className="flex items-center justify-center w-full gap-1">
          <p className="font-freckle text-emerald-950 text-sm truncate max-w-[80%]">
            {account?.bio?.slice(0, 50)}...
          </p>
          <button
            className="font-freckle text-emerald-950 underline text-sm flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: open expanded bio dialog or page
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
