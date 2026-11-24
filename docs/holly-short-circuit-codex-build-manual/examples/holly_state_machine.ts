export type HollyState = "idle" | "listening" | "understanding" | "thinking" | "speaking" | "minimized" | "error";
export type HollyEvent =
  | {type:"START_LISTENING"}|{type:"TRANSCRIPT_FINAL"}|{type:"AI_STARTED"}
  | {type:"SPEECH_STARTED"}|{type:"SPEECH_ENDED"}|{type:"BARGE_IN"}
  | {type:"MINIMIZE"}|{type:"RESTORE"}|{type:"FAIL"}|{type:"RESET"};

export function transition(state:HollyState,event:HollyEvent):HollyState {
  switch(event.type){
    case "START_LISTENING": return "listening";
    case "TRANSCRIPT_FINAL": return "understanding";
    case "AI_STARTED": return "thinking";
    case "SPEECH_STARTED": return "speaking";
    case "SPEECH_ENDED": return "idle";
    case "BARGE_IN": return "listening";
    case "MINIMIZE": return "minimized";
    case "RESTORE": return "idle";
    case "FAIL": return "error";
    case "RESET": return "idle";
    default: return state;
  }
}
