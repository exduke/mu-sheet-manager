<template>
    <div class="sheet-side-menu">
        <h5>{{ title }}</h5>
        <el-menu @select="handleElMenuSelect" :ref="handleElMenuUpdate">
            <el-menu-item v-for="i in items.length" :key="i - 1" :index="(i - 1).toString()">
                <span class="menu-item-title" :class="{ 'menu-item-untitled': items[i - 1].length == 0 }"
                    ref="domMenuItemSpan">
                    {{ items[i - 1].length ? items[i - 1] : 'untitled' }}
                </span>
            </el-menu-item>
            <el-button @click="handleNewBtnClick" icon="Plus" size="large">
                new
            </el-button>
            <el-button @click="handleDelBtnClick" icon="Minus" size="large">
                del
            </el-button>
            <el-button @click="handleSaveBtnClick" size="large">
                <el-icon>
                    <Download />
                </el-icon>
                <span>
                    save
                </span>
            </el-button>
            <el-upload :before-upload="onFileUpload">
                <el-icon>
                    <Upload />
                </el-icon>
                <span v-html="'\u00a0 load'" />
            </el-upload>
        </el-menu>
    </div>
</template>

<script>
//param
var isNewItemActived = false
</script>

<script setup>
import { ref } from 'vue';

// onMounted(() => {
//     for (let i = 0; i < props.items.length; i++) {
//         if (props.items[i][0] < 0)
//             throw new Error("key shouldn't be less than 0: " + props.items[i])
//     }
// })

//props
const props = defineProps(['title', 'items'])

//emit
const emit = defineEmits(['new', 'del', 'select', 'load', 'save'])

//data
const domMenuItemSpan = ref(null)

//method
const handleElMenuUpdate = () => {
    if (domMenuItemSpan.value)
        if (!isNewItemActived && domMenuItemSpan.value.length == props.items.length) {
            domMenuItemSpan.value[domMenuItemSpan.value.length - 1].click()
            isNewItemActived = true
        }
}
const handleNewBtnClick = () => {
    isNewItemActived = false
    emit('new')
}
const handleDelBtnClick = ()=>{
    emit('del')
}
const handleElMenuSelect = (index) => {
    emit('select', index)
}
const handleSaveBtnClick = ()=>{
    emit('save')
}
const onFileUpload = (file) => {
    let fileReader = new FileReader()
    fileReader.onloadend = () => {
        emit('load', fileReader.result)
    }
    fileReader.readAsText(file)
    return false
}

</script>

<style>
.sheet-side-menu * {
    font-size: 1rem;
    text-align: center;
}

.sheet-side-menu .menu-item-title {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.sheet-side-menu .menu-item-untitled {
    opacity: 0.3;
}

.sheet-side-menu .el-menu {
    border-top: 1px solid transparent;
    border-color: rgba(80, 80, 80, 0.3);
}

.sheet-side-menu .el-button {
    border-style: none;
    border-radius: 0;
    width: 100%;
    height: 56px;
}

.sheet-side-menu .el-button+.el-button {
    margin: 0;
}

.sheet-side-menu .el-upload {
    width: 100%;
    height: 56px;
}

.sheet-side-menu .el-upload:hover {
    background-color: #ecf5ff;
}
</style>