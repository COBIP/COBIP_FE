import { ChangeEvent } from 'react';

interface LoginProps {
  id: string;
  text: string;
  type: string;
  label: string;
  className?: string; // ?를 붙여서 필수가 아닌 옵션으로 만듭니다.
  // 1. value와 onChange 타입을 추가합니다.
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function LoginInput(props: LoginProps){
    
    return(
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700" htmlFor={props.id}>
                {props.label}
            </label>
            <input 
                className={`${props.className ?? ''} h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D7C9FB]/50 focus:border-[#D7C9FB] transition-all duration-200`}
                id={props.id} 
                placeholder={props.text} 
                type={props.type}
                value={props.value}
                onChange={props.onChange}
            /> 
        </div>
    );
}