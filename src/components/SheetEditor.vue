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
                <el-button :disabled="disable">
                    audio preview
                </el-button>
            </div>
            <div class="note-list-editor-body">
                <!-- use index i as v-bind:key will definitely cause performance problems since virtual dom wont work normally -->
                <NoteEditor v-for="i in sheet.noteList.length" :key="i" v-model="sheet.noteList[i - 1]"
                    :style_txt="style_txt" @click="indexNoteSelect = i - 1" :is_active="indexNoteSelect == i - 1"
                    :is_b_mode="isBMode" />
            </div>
        </div>

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
import { ref, computed, watch } from 'vue'
import NoteEditor from '@/components/NoteEditor.vue'
import { ElDialog, ElInput, ElMessage, ElInputNumber, textProps } from 'element-plus';

//model
const sheet = defineModel()

//props
const props = defineProps(['disable'])

//data
const fontSize = ref('1.5')
const indexNoteSelect = ref(0)
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

//method
const on_add_btn_clicked = () => {
    sheet.value.noteList.splice(indexNoteSelect.value + 1, 0, new Note(EnumNoteScale.do, EnumNoteLen['1/4'], false, EnumNoteScaleGroup.mid, true))
}
const on_del_btn_clicked = () => {
    sheet.value.noteList.splice(indexNoteSelect.value, 1)
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
    isBMode.value = (newVal.search('#') >= 0)
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