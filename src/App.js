
import './App.css';
import { Editor, EditorState, convertToRaw, convertFromRaw, Modifier, RichUtils } from 'draft-js';
import { useState, useEffect } from 'react';


function App() {

  const [editorState, setEditorState] = useState(() => {
    // for saving everything typed in the editor into localstorage
    const savedData = localStorage.getItem("draftEditorContent");
    if (savedData) {
      return EditorState.createWithContent(convertFromRaw(JSON.parse(savedData)));
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
  }, [editorState]);

  // custom function to apply style
  const customStyleMap = {
    BOLD: { fontWeight: 'bold' },
    UNDERLINE: { textDecoration: 'underline' },
    COLOR_RED: { color: 'red' },
  };

  const handleBeforeInput = (chars, editorState) => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const startKey = selectionState.getStartKey();
    const startOffset = selectionState.getStartOffset();
    const block = contentState.getBlockForKey(startKey);
    const blockText = block.getText();
    const textBeforeCursor = blockText.slice(0, startOffset);
    const textBeforeCursortwochar = blockText.slice(Math.max(0, startOffset - 2), startOffset);
    const textBeforeCursorthreechar = blockText.slice(Math.max(0, startOffset - 3), startOffset);

    // for applying bold style to the text if user types '*' followed by space and also removes * after applying the style
    if (textBeforeCursor === "* ") {
      const textSelection = selectionState.merge({
        anchorOffset: startOffset - 2,
        focusOffset: startOffset,
      });

      const contentStateWithBold = Modifier.applyInlineStyle(
        contentState,
        textSelection,
        "BOLD"
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithBold,
        "apply-inline-style"
      );

      setEditorState(newEditorState);
      return "handled";
    } 
    // for applying underline style to the text if user types '***' followed by space and also removes *** after applying the style
    else if (textBeforeCursorthreechar.endsWith("***")) {   
      const textSelection = selectionState.merge({
        anchorOffset: startOffset - 3,
        focusOffset: startOffset,
      });

      const contentStateWithUnderline = Modifier.applyInlineStyle(
        contentState,
        textSelection,
        "UNDERLINE"
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithUnderline,
        "apply-inline-style"
      );

      setEditorState(newEditorState);
      return "handled";
    } 
     // for applying color-red style to the text if user types '**' followed by space and also removes ** after applying the style
    else if (textBeforeCursortwochar === "**" && chars === " ") {
      const textSelection = selectionState.merge({
        anchorOffset: startOffset - 2,
        focusOffset: startOffset,
      });

      const contentStateWithColorRed = Modifier.applyInlineStyle(
        contentState,
        textSelection,
        "COLOR_RED"
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithColorRed,
        "apply-inline-style"
      );

      setEditorState(newEditorState);
      return "handled";
    } 
     // for applying header-one style to the text if user types '#' followed by space and also removes # after applying the style
    else if (textBeforeCursor.endsWith("#")) {
      const textSelection = selectionState.merge({
        anchorOffset: startOffset - 1,
        focusOffset: startOffset,
      });

      const contentStateWithHeader = Modifier.setBlockType(
        contentState,
        textSelection,
        "header-one"
      );

      const newEditorState = EditorState.push(
        editorState,
        contentStateWithHeader,
        "change-block-type"
      );

      setEditorState(newEditorState);
      return "handled";
    }

    return "not-handled";
  };

  function handleKeyCommand(command, editorState){
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
  };


  return (
    <div className="App">
      <span className='page-title'>Demo Editor by Prerana Kadam</span>
      <button className='save-btn' onClick={() => console.log(editorState.getCurrentContent())}>Save</button>
      <div className='editor-class'>
        <Editor editorState={editorState}
          handleBeforeInput={handleBeforeInput}
          handleKeyCommand={handleKeyCommand}
          onChange={onEditorStateChange} 
          customStyleMap={customStyleMap} />
      </div>
    </div>
  );
}
export default App;
