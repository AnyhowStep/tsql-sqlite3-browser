import {FromSqliteMessage, ToSqliteMessage, ISqliteWorker} from "./worker.sql";

export class SqliteWorker implements ISqliteWorker {
    onmessage : undefined|((message : { data : FromSqliteMessage }) => void);
    onmessageerror : undefined|((error : any) => void);
    onerror : undefined|((error : any) => void);

    private readonly processMessage : (data : ToSqliteMessage) => void;
    constructor (
        rawWorker : {
            readonly postMessage : (data : ToSqliteMessage) => void;
            readonly setOnMessage : (onMessage : (data : FromSqliteMessage) => void) => void
        }
    ) {
        this.processMessage = rawWorker.postMessage;
        rawWorker.setOnMessage(this.onResult);
    }
    private readonly onResult = (data : FromSqliteMessage) : void => {
        if (this.onmessage == undefined) {
            return;
        }
        this.onmessage({ data });
    };
    postMessage (message : ToSqliteMessage) : void {
        this.processMessage(message);
    }
}
