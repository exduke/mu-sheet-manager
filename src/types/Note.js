import { EnumNoteScale, EnumNoteScaleGroup, EnumNoteLen } from "@/enums/Note"

export default class Note {
    static errorEnumScale = new Error('note scale out of enum')
    static errorEnumScaleGroup = new Error('note scale group out of enum')
    static errorEnumNoteLen = new Error('note length out of enum')
    static errorBracketDismatch = new Error('note txt barcket dismatch')
    static errorMutiNumber = new Error('note txt mutiple number')
    static errorNoNumber = new Error('note txt no number')
    static errorMutiSharp = new Error('note txt mutiple sharp')

    constructor(scale, length, half, scaleGroup, empty = false) {
        if (!Object.values(EnumNoteScale).includes(scale))
            throw Note.errorEnumScale
        if (!Object.values(EnumNoteScaleGroup).includes(scaleGroup))
            throw Note.errorEnumScaleGroup
        if (!Object.values(EnumNoteLen).includes(length))
            throw Note.errorEnumNoteLen
        this.half = half ? true : false
        this.scale = scale
        this.scaleGroup = scaleGroup
        this.length = length
        this.empty = empty
    }

    // 1 = 0; 3 = 2; 4 = 2.5; [1] = 6;
    toNumber() {
        let result = this.scaleGroup * 6
        result += this.scale
        if (this.scale > 3)
            result -= 0.5
        if (this.half)
            result += 0.5
        result -= 1
        return result
    }

    fromNumber(num) {
        let temp = num /6
        if (temp < 0)
            temp -= 1
        temp = parseInt(temp)
        if (!Object.values(EnumNoteScaleGroup).includes(temp))
            throw Note.errorEnumScaleGroup
        this.scaleGroup = temp
        temp = num % 6
        if (temp < 0)
            temp += 6
        temp += 1
        if (temp > 3)
            temp += 0.5
        this.scale = parseInt(temp)
        this.half = (temp - this.scale) ? true : false
    }

    raise_key(offset) {
        let num = this.toNumber()
        num += offset
        this.fromNumber(num)
    }

    toTxt() {
        if (this.empty) {
            if (this.length == EnumNoteLen["1/1"])
                return '<br />'
            else
                return ' '
        }

        let result = this.scale.toString()
        if (this.half)
            result = '#' + result
        if (!this.scaleGroup)
            return result
        if (this.scaleGroup > 0) {
            result = '['.repeat(this.scaleGroup) + result + ']'.repeat(this.scaleGroup)
        }
        else {
            result = '('.repeat(-this.scaleGroup) + result + ')'.repeat(-this.scaleGroup)
        }
        return result
    }

    fromTxt(txt) {
        let stack = []
        let i = 0
        let scaleGroup = 0
        let half = false
        let flagNumberOnce = false

        while (i < txt.length) {
            char = txt[i++]
            if (char == '[') {
                stack.push(char)
                scaleGroup += 1
            }
            else if (char == '(') {
                stack.push(char)
                scaleGroup -= 1
            }
            else if (char == ']' && stack.pop() != '[')
                throw Note.errorBracketDismatch
            else if (char == ')' && stack.pop() != '([)')
                throw Note.errorBracketDismatch
            else if (char == '#') {
                if (half)
                    throw Note.errorMutiSharp
                half = true
            }
            else if (/\d/.test(char)) {
                if (flagNumberOnce)
                    throw Note.errorMutiNumber
                flagNumberOnce = true
                var scale = parseInt(char)
            }
        }

        if (!scale)
            throw Note.errorNoNumber

        this.scale = scale
        this.scaleGroup = scaleGroup
        this.half = half
    }

    toJson() {
        // return {
        //     scale: this.scale,
        //     scaleGroup: this.scaleGroup,
        //     half: this.half,
        //     length: this.length,
        //     empty: this.empty,
        // }
        return [this.scale, this.scaleGroup, this.half, this.length, this.empty]
    }
    fromJson(obj) {
        // this.scale = obj['scale']
        // this.scaleGroup = obj['scaleGroup']
        // this.half = obj['half']
        // this.length = obj['length']
        // this.empty = obj['empty']
        this.scale = obj[0]
        this.scaleGroup = obj[1]
        this.half = obj[2]
        this.length = obj[3]
        this.empty = obj[4]
    }
}
