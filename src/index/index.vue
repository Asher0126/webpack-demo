<template>
    <div>
        <h3>Hello This is a test</h3>
        <ul>
            <li class="ico-l1" />
            <li class="ico-l2" />
            <li class="ico-l3" />
            <li class="ico-l4" />
        </ul>
        <h3>{{ time }}</h3>

        <quill-editor
            ref="myQuillEditor"
            v-model="content"
            :options="editorOption"
            @blur="onEditorBlur($event)"
            @focus="onEditorFocus($event)"
            @ready="onEditorReady($event)"
        />
    </div>
</template>

<script>
import moment from 'moment';
import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

export default {
    name: 'Index',
    components: { quillEditor },
    data: () => ({
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        content: 'hello world',
        editorOption: {}
    }),
    methods: {
        onEditorBlur (e) {
            console.log("onEditorBlur -> e", e);
        },
        onEditorFocus (e) {
            console.log("onEditorFocus -> e", e);
        },
        onEditorReady (e) {
            console.log("onEditorReady -> e", e);
        }
    },
};
</script>

<style lang="scss">
@import '~sprite.scss';

.ico-l1 {
    @include sprite($img1);
}

.ico-l2 {
    @include sprite($img2);
}

.ico-l3 {
    @include sprite($img3);
}

.ico-l4 {
    @include sprite($img4);
}
</style>
