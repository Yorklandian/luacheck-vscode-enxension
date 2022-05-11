import {
    TextDocument,
    DiagnosticSeverity,
    Diagnostic,
    Range,
} from 'vscode'

import * as cp from 'child_process'
import * as path from 'path';
import * as vscode from 'vscode';
let os = require("os");

export class LuaCheckLinter {

    private static getLuaCheck():string{
        let exePath = __dirname.replace("out","") + "bin\\win32\\luacheck.exe";
        return exePath;
    }

    public static processFile(textDocument:TextDocument){
        let filePath:string = textDocument.uri.fsPath;
        let luaCheck:string = this.getLuaCheck();
        
        let iconv = require('iconv-lite');
        iconv.skipDecodeWarning = true;
        let encoding = 'cp936';
        let binaryEncoding = 'binary';

        let luacheckArgs = "--ranges"

        return new Promise(resolve =>{
            cp.exec(luaCheck+" "+filePath+" "+ luacheckArgs,{encoding: binaryEncoding},function(err,stdout,stderr){
                // console.log('err: '+ iconv.decode(stderr,encoding));
                // console.log('out: '+iconv.decode(stdout,encoding));
                // console.log('--------------');
                resolve(stdout);
            });
        });
    }
    
    public static async processOutput(document:TextDocument) {
        let res = await LuaCheckLinter.processFile(document).then(out =>{
            let diagnostics:Diagnostic[] = [];
            let content = String(out);
            let msgs = content.split('\n');
            if(msgs.length<=4){
                return diagnostics;
            }
            msgs.shift();
            msgs = msgs.map(msg=>msg.trim());
            let warnings:string[] = []
            for(let msg of msgs){
                if(msg.indexOf(document.fileName)!= -1){
                    warnings.push(msg);
                }
            }
            for(let warning of warnings){
                warning = warning.replace(document.fileName+':',"");
                let infos = warning.split(':');
                if(infos.length<3){
                    return diagnostics;
                }
                let line = Number(infos[0]);
                let characters = infos[1].split('-');
                let startCharacter = Number(characters[0]);
                let endCharacter = Number(characters[1]);
                let message = infos[2];
                let range = new Range(line-1,startCharacter,line-1,endCharacter);
                let diagnostic:Diagnostic = {
                    range: range,
                    severity: vscode.DiagnosticSeverity.Warning,
                    message: message,
                    source: 'luacheck'
                }
                diagnostics.push(diagnostic);
            }
            return diagnostics;
        });
        return res;
    }


}
