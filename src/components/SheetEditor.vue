<template>
    <div class="sheet-editor">
        <el-row :gutter="20">
            <el-col :span="4">
                <el-input placeholder="plz enter title here" :disabled="disable" v-model="sheet.title" />
            </el-col>
            <el-col :span="3">
                <el-select :disabled="disable" placeholder="select tone" v-model="sheet.tone">
                    <el-option v-for="(item, index) in Object.values(EnumSheetTone)" :label="'1 = ' + item"
                        :value="item" :key="index" />
                </el-select>
            </el-col>
            <el-col :span="3">
                <el-button @click="on_b_mode_btn_clicked" :disabled="disable">
                    using: {{ isBMode ? 'b' : '#' }}
                </el-button>
            </el-col>
            <el-col :span="3">
                <el-select :disabled="disable" v-model="fontSize" placeholder="select font size">
                    <el-option label="small font size" value="1" />
                    <el-option label="middle font size" value="1.5" />
                    <el-option label="large font size" value="2" />
                </el-select>
            </el-col>
            <el-col :span="3">
                <el-button @click="on_display_btn_clicked" :disabled="disable">
                    display: {{ displayMode }}
                </el-button>
            </el-col>
            <el-col :span="8">
                <el-button :disabled="disable" @click="on_fromtext_btn_clicked">from text</el-button>
                <el-button :disabled="disable" @click="isKeyOffsetDialogShow = true">+/- key</el-button>
            </el-col>
        </el-row>

        <div class="note-list-editor" v-if="displayMode == 'notes'">
            <div class="note-list-editor-head">
                <el-button :disabled="disable" @click="on_add_btn_clicked">
                    add
                </el-button>
                <el-button :disabled="disable" @click="on_del_btn_clicked">
                    delete
                </el-button>
                <el-button :disabled="true">
                    audio preview
                </el-button>
            </div>
            <div class="note-list-editor-body" ref="refNoteListBody">
                <NoteItem v-for="(note, i) in sheet.noteList" :key="i" :note="note" :style_txt="style_txt"
                    :is_active="indexNoteSelect == i" :is_b_mode="isBMode" @click="on_note_item_clicked(i, $event)" />
            </div>
        </div>

        <!-- the one and only NoteEditor: it follows the clicked note, resets and rebinds on every move -->
        <NoteEditor v-if="isEditorVisible && activeNote && anchorEl" :key="indexNoteSelect" v-model="activeNote"
            :anchor-el="anchorEl" :visible="isEditorVisible" @close="close_note_editor" />

        <div class="note-list-txt-displayer" v-if="displayMode == 'text'" :style="style_txt"
            v-html="sheet.toTxt(isBMode)" />

        <el-dialog v-model="isfromTxtDialogShow" title="plz enter text" :show-close="false">
            <el-input type="textarea" v-model="txt" :autosize="{ minRows: 5, maxRows: 10 }" />
            <template #footer>
                <div v-loading="isloading" class="dialog-footer">
                    <el-select v-model="txt2notesDefaultLen">
                        <el-option v-for="key in Object.keys(EnumNoteLen)" :key="key" :label="key"
                            :value="EnumNoteLen[key]" />
                    </el-select>
                    <el-button @click="on_fromtext_dialog_confirm_btn_clicked" type="primary">
                        confirm
                    </el-button>
                    <el-button @click="isfromTxtDialogShow = false">
                        cancel
                    </el-button>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="isKeyOffsetDialogShow" title="key offset" style="width:200px" :show-close="false" center>
            <div style="display: flex; justify-content: center;">
                <el-input-number v-model="keyOffset" :step="0.5" />
            </div>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="on_keyoffset_dialog_confirm_btn_clicked" type="primary">
                        confirm
                    </el-button>
                    <el-button @click="isKeyOffsetDialogShow = false">
                        cancel
                    </el-button>
                </div>
            </template>
        </el-dialog>

    </div>
</template>

<script>
import Note from '@/types/Note'
import { EnumSheetTone } from '@/enums/Sheet';
import { EnumNoteLen, EnumNoteScale, EnumNoteScaleGroup } from '@/enums/Note';
</script>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import NoteEditor from '@/components/NoteEditor.vue'
import NoteItem from '@/components/NoteItem.vue'
import { ElDialog, ElInput, ElMessage, ElInputNumber } from 'element-plus';

//model
const sheet = defineModel()

//props
const props = defineProps(['disable'])

//data
const fontSize = ref('1.5')
const indexNoteSelect = ref(0)
const isEditorVisible = ref(false)
const anchorEl = ref(null)
const refNoteListBody = ref(null)
const isfromTxtDialogShow = ref(false)
const isloading = ref(false)
const txt = ref('')
const txt2notesDefaultLen = ref(EnumNoteLen['1/4'])
const displayMode = ref('text')
const isKeyOffsetDialogShow = ref(false)
const keyOffset = ref(0)
const isBMode = ref(false)

// computed
const style_txt = computed(() => {
    return 'font-size: ' + fontSize.value + 'rem;'
})
// the note the single NoteEditor is bound to
const activeNote = computed({
    get() {
        return sheet.value.noteList[indexNoteSelect.value]
    },
    set(val) {
        sheet.value.noteList[indexNoteSelect.value] = val
    }
})

//method
const close_note_editor = () => {
    isEditorVisible.value = false
    anchorEl.value = null
}
// the note items are patched in place, so the anchor of the editor is always looked up again
// by index instead of being kept as a stored element
const refresh_note_editor_anchor = async () => {
    await nextTick()
    if (!isEditorVisible.value)
        return
    anchorEl.value = refNoteListBody.value ? (refNoteListBody.value.children[indexNoteSelect.value] ?? null) : null
    if (!anchorEl.value)
        isEditorVisible.value = false
}
// move the single NoteEditor to the clicked note: it gets a new anchor and, through
// :key="indexNoteSelect", a brand new instance bound to the newly selected note
const on_note_item_clicked = (index, e) => {
    const el = (e && e.currentTarget) || (refNoteListBody.value ? (refNoteListBody.value.children[index] ?? null) : null)
    if (index == indexNoteSelect.value) {
        // clicking the selected note again toggles the editor, just like the old popovers did
        if (isEditorVisible.value)
            close_note_editor()
        else if (el) {
            anchorEl.value = el
            isEditorVisible.value = true
        }
        return
    }
    indexNoteSelect.value = index
    anchorEl.value = el
    isEditorVisible.value = true
}
const on_add_btn_clicked = () => {
    sheet.value.noteList.splice(indexNoteSelect.value + 1, 0, new Note(EnumNoteScale.do, EnumNoteLen['1/4'], false, EnumNoteScaleGroup.mid, true))
}
const on_del_btn_clicked = () => {
    sheet.value.noteList.splice(indexNoteSelect.value, 1)
    if (sheet.value.noteList.length == 0) {
        indexNoteSelect.value = 0
        close_note_editor()
        return
    }
    if (indexNoteSelect.value > sheet.value.noteList.length - 1)
        indexNoteSelect.value = sheet.value.noteList.length - 1
    refresh_note_editor_anchor()
}
const on_fromtext_btn_clicked = () => {
    isfromTxtDialogShow.value = true
    txt.value = ''
}
const on_fromtext_dialog_confirm_btn_clicked = () => {
    isloading.value = true

    // maybe cuz it's computing mission, asynchronization works bad
    new Promise((resolve, reject) => {
        sheet.value.fromTxt(txt.value, txt2notesDefaultLen.value, isBMode.value)
        resolve()
    }).then(() => {
        isfromTxtDialogShow.value = false
        isloading.value = false
    }).catch((e) => {
        ElMessage.error(e.message)
        isloading.value = false
    })

    // try {
    //     await promise
    // }
    // catch (e) {
    //     ElMessage.error(e.message)
    // }
    // isloading.value = false
    // isfromTxtDialogShow.value = false
}
const on_keyoffset_dialog_confirm_btn_clicked = () => {
    try {
        sheet.value.raise_key(keyOffset.value)
    }
    catch (e) {
        ElMessage.error(e.message)
        return
    }
    isKeyOffsetDialogShow.value = false
}
const on_display_btn_clicked = () => {
    switch (displayMode.value) {
        case 'text':
            displayMode.value = 'notes'
            break
        case 'notes':
            displayMode.value = 'text'
            break
    }
}
const on_b_mode_btn_clicked = () => {
    // isBMode.value = !isBMode.value
    if (isBMode.value)
        sheet.value.tone = sheet.value.tone[1]
    else
        sheet.value.tone = '#' + sheet.value.tone
}

//watch
watch(() => sheet.value.tone, (newVal, oldVal) => {
    if(newVal)
        isBMode.value = (newVal.search('#') >= 0)
})
// another sheet has another note list: drop the selection and the anchor of the editor
watch(() => sheet.value, () => {
    indexNoteSelect.value = 0
    close_note_editor()
})
// a note can hardly be edited while the sheet is displayed as text
watch(displayMode, (newVal) => {
    if (newVal != 'notes')
        close_note_editor()
})

</script>

<style>
.sheet-editor>.el-row {
    margin-bottom: 20px;
}

.sheet-editor>.el-row:last-child {
    margin-bottom: 0;
}

.sheet-editor>.el-row>.el-col:last-child {
    display: flex;
    justify-content: flex-end;
    overflow: hidden;
}

.sheet-editor>.el-row>.el-col:not(*:last-child)>.el-button {
    width: 100%;
}

.sheet-editor .note-list-editor {
    height: 90%;
    background-color: white;
    border: solid rgba(80, 80, 80, 0.3) 1px;
    border-radius: 10px;
    display: flex;
    flex-flow: column;
}

.sheet-editor .note-list-editor .note-list-editor-body{
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: flex-start;
    overflow-y: auto;
}

.sheet-editor .note-list-editor .note-list-editor-body>* {
    margin-left: 5px;
    margin-right: 5px;
}

.sheet-editor .note-list-editor .note-list-editor-head {
    display: flex;
    padding: 10px;
    border-bottom: solid rgba(80, 80, 80, 0.3) 1px ;
}

.sheet-editor .note-list-editor .note-list-editor-head>* {
    min-width: 5%;
}

/* achieved by template #footer */
/* .sheet-editor .el-dialog>div>*:not(*:first-child) {
    margin-top: 15px;
} */
/* .sheet-editor .el-dialog .dialog-footer {
    display: flex;
    justify-content: flex-end;
} */

.sheet-editor .el-dialog .dialog-footer>*:not(.el-button) {
    margin-right: 15px;
    width: 20%;
    max-width: 150px;
    min-width: 100px;
}

.sheet-editor .note-list-txt-displayer {
    height: 90%;
    background-color: white;
    border: solid rgba(80, 80, 80, 0.3) 1px;
    border-radius: 10px;
    overflow-y: auto;
    text-align: center;
    padding: 20px;
}
</style>
