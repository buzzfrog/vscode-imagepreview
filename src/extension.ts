'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let previewUri = vscode.Uri.parse('image-preview://image-preview');
    
    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {
        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
        
        public provideTextDocumentContent(uri: vscode.Uri): string {
            return this.displayImage();
        }
        
        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private displayImage() {
            // http://3.bp.blogspot.com/-MNHUaswWB4U/TYSDRqoaABI/AAAAAAAAEoc/4pFz9vT3OIA/s1600/Katt%252C%2Bkorre%2Boch%2BPaavo%2B006.jpg
            let editor = vscode.window.activeTextEditor;
            let text = editor.document.getText();
            let selStart = editor.document.offsetAt(editor.selection.anchor);
            let imageUrlStart = text.lastIndexOf('http', selStart);
            
            let imageTypeExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
            var winningExtension = '';
            var postionWhereExtensionIsFound = 999;
            imageTypeExtensions.forEach(extensionName => {
                let thisExtensionsPosition = text.indexOf(extensionName, selStart);
                console.log(`${extensionName} - ${thisExtensionsPosition} - ${postionWhereExtensionIsFound} `)
                if(thisExtensionsPosition > 0 && thisExtensionsPosition < postionWhereExtensionIsFound) {
                    postionWhereExtensionIsFound = thisExtensionsPosition;
                    winningExtension = extensionName;
                }    
            });            
            
            if(postionWhereExtensionIsFound != 999) {
                return `<img src='${text.slice(imageUrlStart, postionWhereExtensionIsFound + winningExtension.length)}'/>`;            
            }
        }
    }
    
    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('image-preview', provider);
    
    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
        if (e.document === vscode.window.activeTextEditor.document) {
            provider.update(previewUri);
        }
    });

    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
        if (e.textEditor === vscode.window.activeTextEditor) {
            provider.update(previewUri);
        }
    })

    let disposable = vscode.commands.registerCommand('extension.previewImageUrl', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two).then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });

    });
    
    context.subscriptions.push(disposable, registration);

    
}

// this method is called when your extension is deactivated
export function deactivate() {
}