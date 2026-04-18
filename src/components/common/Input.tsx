interface LoginProps {
  id: string;
  text: string;
  type: string;
  label: string;
  className : string;
}

export default function LoginInput(props: LoginProps){
    
    return(
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700" htmlFor="email">{props.label}</label>
            <input className={`${props.className ?? ''} h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D7C9FB]/50 focus:border-[#D7C9FB] transition-all duration-200`}
                id={props.id} placeholder={props.text} type={props.type}
            /> 
        </div>
              
    );
}