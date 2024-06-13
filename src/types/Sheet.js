import Note from "@/types/Note";
import { EnumNoteScale, EnumNoteScaleGroup, EnumNoteLen } from "@/enums/Note";

export default class Sheet {
    static errorBracketDismatch = new Error('sheet txt barcket dismatch')

    constructor(title, tone, noteList) {
        this.title = title
        this.tone = tone
        this.noteList = noteList ? noteList : []
    }

    toJson() {
        let noteList = []
        for (let i = 0; i < this.noteList.length; i++) {
            noteList.push(this.noteList[i].toJson())
        }
        return {
            title: this.title,
            tone: this.tone,
            noteList: noteList
        }
    }

    fromJson(obj) {
        this.title = obj['title']
        this.tone = obj['tone']
        let noteList = []
        for (let i = 0; i < obj['noteList'].length; i++) {
            noteList.push(new Note(EnumNoteScale.do, EnumNoteLen["1/1"], false, EnumNoteScaleGroup.mid))
            noteList[noteList.length - 1].fromJson(obj['noteList'][i])
        }
        this.noteList = noteList
    }

    toTxt(isBMode = false) {
        let result = ''
        for (let i in this.noteList) {
            result += this.noteList[i].toTxt(isBMode)
        }
        return result
    }

    fromTxt(txt, defaultNoteLen = EnumNoteLen["1/4"], isBMode = 'false') {
        let stack = []
        let tempNoteList = []
        let scaleGroup = EnumNoteScaleGroup.mid
        let half = isBMode
        let i = 0
        while (i < txt.length) {
            let char = txt[i++]
            console.log(char)
            if (/\d/.test(char)) {
                tempNoteList.push(new Note(parseInt(char), defaultNoteLen, half, scaleGroup))
                half = isBMode
            }
            else if (char == ' ' || char == '\u00a0') {
                tempNoteList.push(new Note(EnumNoteScale.do, defaultNoteLen, half, scaleGroup, true))
            }
            else if (char == '\n') {
                tempNoteList.push(new Note(EnumNoteScale.do, EnumNoteLen["1/1"], half, scaleGroup, true))
            }
            else if (char == '#' || char == 'b') {
                half = !isBMode
            }
            else if (char == '[') {
                scaleGroup += 1
                stack.push('[')
            }
            else if (char == ']') {
                if (stack.pop() != '[')
                    throw Sheet.errorBracketDismatch
                scaleGroup -= 1
            }
            else if (char == '(') {
                scaleGroup -= 1
                stack.push('(')
            }
            else if (char == ')') {
                if (stack.pop() != '(')
                    throw Sheet.errorBracketDismatch
                scaleGroup += 1
            }
            else
                throw new Error('invalid input: ' + char + ' \\u' + char.charCodeAt(0).toString(16))
        }

        this.noteList = this.noteList.concat(tempNoteList)

        // this.noteList = tempNoteList

        // this.noteList.splice(0, this.noteList.length)
        // this.noteList.concat(tempNoteList)
    }

    raise_key(offset) {
        for (let i in this.noteList) {
            if (!this.noteList[i].empty)
                this.noteList[i].raise_key(offset)
        }
    }
}
