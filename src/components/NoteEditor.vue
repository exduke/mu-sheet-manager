<template>
    <!-- <div ref="refBox" :style="style_box_width"> -->
    <div ref="refBox">
        <div class="note-container" tabindex="-1">
            <div class="bg" :class="{ 'active': is_active }" :style="style_bg_width" ref="refBg" />
            <span class="item-sharp" :style="style_txt" v-html="item_sharp_html" />
            <span class="item-dot-top" :style="style_txt">
                {{ dotAbove }}
                <br v-show="!dotAbove" />
            </span>
            <span class="item-number" :style="style_txt"
                v-html="'\u00a0' + (note.empty ? '\u00a0\u00a0' : note.scale) + '\u00a0'" />
            <span class="item-dot-bottom" :style="style_txt">
                {{ dotBelow }}
                <br v-show="!dotBelow" />
            </span>

            <el-popover virtual-triggering :virtual-ref="refBox" trigger="click" width="fit-content">
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
        </div>
    </div>
</template>

<script>
import { EnumNoteScale, EnumNoteScaleGroup, EnumNoteLen } from '@/enums/Note';
</script>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { ElPopover, ElInputNumber, ElSelect, ElMessage } from 'element-plus';

//prop
const props = defineProps(['style_txt', 'is_active', 'is_b_mode'])

//model
const note = defineModel()

//data
const refBg = ref()
const refBox = ref()

//computed
const dotAbove = computed(() => {
    if (note.value.empty)
        return ''
    if (note.value.scaleGroup == EnumNoteScaleGroup.high)
        return '•'
    if (note.value.scaleGroup == EnumNoteScaleGroup.highhigh)
        return '••'
    return ''
})
const dotBelow = computed(() => {
    if (note.value.empty)
        return ''
    if (note.value.scaleGroup == EnumNoteScaleGroup.low)
        return '•'
    if (note.value.scaleGroup == EnumNoteScaleGroup.lowlow)
        return '••'
    return ''
})
const style_bg_width = computed(() => {
    return 'width:' + note.value.length * 800 + '%;'
})
// vue cant watch dom
// const style_box_width = computed(() => {
//     if (refBg.value)
//         return 'width:' + refBg.value.offsetWidth + 'px;'
//     return ''
// })
const item_sharp_html = computed(()=>{
    if (note.value.empty)
        return '\u00a0\u00a0'
    if (props.is_b_mode)
        return note.value.half ? '\u00a0\u00a0' : 'b'
    else
        return note.value.half ? '#' : '\u00a0\u00a0'
})

//watch
watch(() => note.value.length, async () => {
    await nextTick()
    refBox.value.style.width = refBg.value.offsetWidth + 'px'
}, { immediate: true })
watch(() => props.style_txt, async () => {
    await nextTick()
    refBox.value.style.width = refBg.value.offsetWidth + 'px'
}, { immediate: true })
// will be triggered when change sheet
// watch(() => note.value.scale, () => {
//     note.value.empty = false
// })

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

</script>

<style>
.note-container {
    display: grid;
    grid-template-rows: auto auto auto;
    grid-template-columns: auto auto auto;
    width: fit-content;
    text-align: center;
}

.note-container .item-sharp {
    grid-row: 2;
    grid-column: 1;
}

.note-container .item-number {
    grid-row: 2;
    grid-column: 2;
}

.note-container .item-dot-top {
    grid-row: 1;
    grid-column: 2;
}

.note-container .item-dot-bottom {
    grid-row: 3;
    grid-column: 2;
}

.note-container .bg {
    grid-column: 1 / 4;
    grid-row: 1 / 4;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 10px;
    height: 50%;
    align-self: center;
}

/* .note-container:focus .bg {
    background-color: #409eff;
} */
.note-container .bg.active {
    background-color: #409eff;
}

.note-container:hover .bg {
    background-color: #a0cfff;
}

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
