'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process'
import { resolve } from 'dns';
import { LuaCheckLinter } from './linter';
export function activate(context: vscode.ExtensionContext) {

	const collection = vscode.languages.createDiagnosticCollection('luacheck diagnostic');
	if (vscode.window.activeTextEditor) {
		updateDiagnostics(vscode.window.activeTextEditor.document, collection);
	}
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			updateDiagnostics(editor.document, collection);
		}
	}));
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
	// if (document && path.basename(document.uri.fsPath) === 'sample-demo.rs') {
	// 	collection.set(document.uri, [{
	// 		code: '',
	// 		message: 'cannot assign twice to immutable variable `x`',
	// 		range: new vscode.Range(new vscode.Position(3, 4), new vscode.Position(3, 10)),
	// 		severity: vscode.DiagnosticSeverity.Error,
	// 		source: '',
	// 		relatedInformation: [
	// 			new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(1, 8), new vscode.Position(1, 9))), 'first assignment to `x`')
	// 		]
	// 	}]);
		
	// } else {
	// 	collection.clear();
	// }
	if(document.languageId == 'lua'){
		let diagnostics = LuaCheckLinter.processOutput(document).then(res =>{
			collection.set(document.uri,res);
		});
	}
}
