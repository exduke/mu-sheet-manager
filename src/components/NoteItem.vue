<template>
    <div class="note-item" ref="refBox" @click="emit('click', $event)">
        <div class="note-container">
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
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue';
import { EnumNoteScaleGroup } from '@/enums/Note';

//prop
const props = defineProps(['note', 'style_txt', 'is_active', 'is_b_mode'])

//emit
const emit = defineEmits(['click'])

//data
const refBg = ref()
const refBox = ref()

//computed
const dotAbove = computed(() => {
    if (props.note.empty)
        return ''
    if (props.note.scaleGroup == EnumNoteScaleGroup.high)
        return '\u2022'
    if (props.note.scaleGroup == EnumNoteScaleGroup.highhigh)
        return '\u2022\u2022'
    return ''
})
const dotBelow = computed(() => {
    if (props.note.empty)
        return ''
    if (props.note.scaleGroup == EnumNoteScaleGroup.low)
        return '\u2022'
    if (props.note.scaleGroup == EnumNoteScaleGroup.lowlow)
        return '\u2022\u2022'
    return ''
})
const style_bg_width = computed(() => {
    return 'width:' + props.note.length * 800 + '%;'
})
const item_sharp_html = computed(() => {
    if (props.note.empty)
        return '\u00a0\u00a0'
    if (props.is_b_mode)
        return props.note.half ? '\u00a0\u00a0' : 'b'
    else
        return props.note.half ? '#' : '\u00a0\u00a0'
})

// the bg bar is drawn in percentage of the grid, so the box has to be widened to the bg
// width to keep the note's space proportional to its length
const fit_box_width_to_bg = async () => {
    await nextTick()
    if (!refBox.value || !refBg.value)
        return
    refBox.value.style.width = refBg.value.offsetWidth + 'px'
}

//watch
watch(() => props.note.length, fit_box_width_to_bg, { immediate: true })
watch(() => props.style_txt, fit_box_width_to_bg, { immediate: true })
</script>

<style>
.note-item .note-container {
    display: grid;
    grid-template-rows: auto auto auto;
    grid-template-columns: auto auto auto;
    width: fit-content;
    text-align: center;
    cursor: pointer;
}

.note-item .note-container .item-sharp {
    grid-row: 2;
    grid-column: 1;
}

.note-item .note-container .item-number {
    grid-row: 2;
    grid-column: 2;
}

.note-item .note-container .item-dot-top {
    grid-row: 1;
    grid-column: 2;
}

.note-item .note-container .item-dot-bottom {
    grid-row: 3;
    grid-column: 2;
}

.note-item .note-container .bg {
    grid-column: 1 / 4;
    grid-row: 1 / 4;
    background-color: rgba(80, 80, 80, 0.3);
    border-radius: 10px;
    height: 50%;
    align-self: center;
}

.note-item .note-container .bg.active {
    background-color: #409eff;
}

.note-item .note-container:hover .bg {
    background-color: #a0cfff;
}
</style>
