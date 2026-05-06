interface Props {
    text: string;
    type?: "button" | "submit" | "reset";
}

export default function Button(props: Props){
    return (
        <button
            className="mt-4 h-12 bg-[#D7C9FB] text-slate-900 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-[#cfc1f3] transition-all duration-200 flex items-center justify-center"
            type={props.type || "button"}>
                {props.text}
        </button>
    );
}