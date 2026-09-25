<template>
    <!-- this is the single NoteEditor instance of the app.
         the popover is controlled: only the "visible" prop decides whether it shows, so the
         built in trigger toggle and the built in click-outside close of element-plus are off.
         it is anchored to the note that is currently selected and follows the user's click. -->
    <el-popover :virtual-ref="anchorEl" virtual-triggering trigger="click" :visible="visible"
        width="fit-content">
        <el-row>
            <span>
                scale:
            </span>
            <el-input-number v-model="note.scale" step-strictly :step="1" @change="onInputScaleChanged" />
        </el-row>
        <el-row>
            <span>
                pitch:
            </span>
            <el-input-number v-model="note.scaleGroup" step-strictly :step="1"
                @change="onInputScaleGroupChanged" />
        </el-row>
        <el-row>
            <span>
                length:
            </span>
            <el-select v-model="note.length">
                <el-option v-for="key in Object.keys(EnumNoteLen)" :key="key" :label="key"
                    :value="EnumNoteLen[key]" />
            </el-select>
        </el-row>
        <el-row>
            <span>
                half rise:
            </span>
            <el-select v-model="note.half">
                <el-option label="true" :value="true" />
                <el-option label="false" :value="false" />
            </el-select>
        </el-row>
        <el-row>
            <span>
                empty:
            </span>
            <el-select v-model="note.empty">
                <el-option label="true" :value="true" />
                <el-option label="false" :value="false" />
            </el-select>
        </el-row>
    </el-popover>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { ElPopover, ElInputNumber, ElSelect, ElMessage } from 'element-plus';
import { EnumNoteScale, EnumNoteScaleGroup, EnumNoteLen } from '@/enums/Note';

// nothing may fall through to el-popover: an onUpdate:visible attr would switch element-plus
// out of the controlled mode and break the "move to the clicked note" behaviour
defineOptions({ inheritAttrs: false })

//prop
const props = defineProps({
    // the dom element the popover is anchored to (the selected note item)
    anchorEl: { type: Object, default: null },
    // controlled visibility
    visible: { type: Boolean, default: false },
})

//model
const note = defineModel()

//emit
const emit = defineEmits(['close'])

//method
const onInputScaleGroupChanged = (newVal, oldVal) => {
    if (!Object.values(EnumNoteScaleGroup).includes(newVal)) {
        note.value.scaleGroup = oldVal
        ElMessage('scale group out of range')
    }
}
const onInputScaleChanged = (newVal, oldVal) => {
    note.value.empty = false

    if (Object.values(EnumNoteScale).includes(newVal))
        return
    if (newVal > EnumNoteScale.xi && Object.values(EnumNoteScaleGroup).includes(note.value.scaleGroup + 1)) {
        note.value.scale = EnumNoteScale.do
        note.value.scaleGroup += 1
    }
    else if (newVal < EnumNoteScale.do && Object.values(EnumNoteScaleGroup).includes(note.value.scaleGroup - 1)) {
        note.value.scale = EnumNoteScale.xi
        note.value.scaleGroup -= 1
    }
    else {
        note.value.scale = oldVal
        ElMessage('scale out of range')
    }
}

// close when the user clicks outside of the popover.
// clicks inside a popper (this popover, or the dropdown of the selects inside of it) and
// clicks on a note item (the note list decides whether to move or to toggle) are ignored
const on_document_pointerdown = (e) => {
    const target = e.target
    if (!(target instanceof Element))
        return
    if (target.closest('.el-popper') || target.closest('.note-item'))
        return
    emit('close')
}

//lifecycle
onMounted(() => document.addEventListener('pointerdown', on_document_pointerdown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', on_document_pointerdown))
</script>

<style>
/* unsafe to use .el-popover as root in selector!!!!! */
.el-popover .el-row {
    align-items: center;
}

.el-popover .el-row>* {
    margin: 5px;
    font-size: 1rem;
}

.el-popover .el-row>*:first-child {
    flex: 1;
}

.el-popover .el-row>*:last-child {
    margin-left: auto;
    flex: 1;
}
</style>
