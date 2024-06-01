<template>
    <el-container class="sheet-manager">
        <el-aside width="20%">
            <SideMenu title="Sheets" :items="sheetKeyTitleList" @new="onSideMenuNew" @select="onSideMenuSelect"
                @load="onSideMenuLoad" @save="onSideMenuSave" @del="onSideMenuDel" />
        </el-aside>
        <el-main>
            <SheetEditor class="sheet-editor" :disable="disableSheetEditor" v-model="sheetSelect" />
        </el-main>
        <a v-show="false" ref="a" />

        <el-dialog v-model="isDelConfirmDialogShow" title="confirm delete" :show-close="false">
            <span>r u sure to delete this sheet? </span>
            <template #footer>
                <el-button type="primary" @click="onConfirmDel">
                    Confirm
                </el-button>
                <el-button @click="isDelConfirmDialogShow = false">
                    Cancel
                </el-button>
            </template>
        </el-dialog>
    </el-container>
</template>

<script>
import Sheet from '@/types/Sheet';
import { EnumSheetTone } from '@/enums/Sheet';
</script>

<script setup>
import { computed, ref } from 'vue'
import SideMenu from '@/components/SheetSideMenu.vue'
import SheetEditor from '@/components/SheetEditor.vue';
import { ElDialog } from 'element-plus';

// data
const sheetList = ref([])
const sheetSelectKey = ref(-1)
const a = ref()
const isDelConfirmDialogShow = ref(false)

// computed
const sheetKeyTitleList = computed(() => {
    let result = []
    for (let i = 0; i < sheetList.value.length; i++) {
        result.push(sheetList.value[i].title)
    }
    return result
})
const disableSheetEditor = computed(() => {
    return sheetSelectKey.value < 0 ? true : false
})
const sheetSelect = computed({
    get() {
        return sheetSelectKey.value < 0 ? new Sheet() : sheetList.value[sheetSelectKey.value]
    },
    set(val) {
        sheetList.value[sheetSelectKey.value].set(val)
    }
})

// method
const onSideMenuSelect = (index) => {
    sheetSelectKey.value = index
}
const onSideMenuNew = () => {
    sheetList.value.push(new Sheet('', EnumSheetTone.C, []))
}
const onSideMenuDel = () => {
    isDelConfirmDialogShow.value = true
}
const onConfirmDel = () => {
    sheetList.value.splice(sheetSelectKey.value, 1)
    if (sheetSelectKey.value > sheetList.value.length - 1) {
        sheetSelectKey.value = sheetList.value.length - 1
    }
    isDelConfirmDialogShow.value = false
}
const onSideMenuLoad = (txt) => {
    let data = JSON.parse(txt)
    for (let i = 0; i < data.length; i++) {

        let tmp = new Sheet('', EnumSheetTone.C, [])
        tmp.fromJson(data[i])
        sheetList.value.push(tmp)
    }
}
const onSideMenuSave = () => {
    // let data = '['
    // for (let i = 0; i < sheetList.value.length; i++) {
    //     data += sheetList.value[i].toJsonStr()
    //     data += ','
    // }
    // data = data.slice(0, -1)
    // data += ']'
    let data = []
    for (let i = 0; i < sheetList.value.length; i++) {
        data.push(sheetList.value[i].toJson())
    }
    data = JSON.stringify(data)
    let blob = new Blob([data])
    let url = URL.createObjectURL(blob);
    a.value.href = url;
    a.value.download = 'musheet.json'
    a.value.click()
    URL.revokeObjectURL(url)
}
</script>

<style>
/* .el-container {
    height: 100vh;
} */
.sheet-manager {
    height: 100vh;
}

.sheet-manager .el-aside {
    border-right: 1px solid transparent;
    border-color: rgba(80, 80, 80, 0.3);
    min-width: 200px;
    max-width: 300px;
    background-color: white;
    /* width: 20%; */
    /* height: 100%; */
}

.sheet-manager .sheet-editor {
    height: 100%;
}

.sheet-manager .el-dialog {
    width: 500px;
}
</style>