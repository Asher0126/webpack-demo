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
    </div>
</template>

<script>
import moment from 'moment';

export default {
    name: 'Index',
    data: () => ({
        time: moment().format('YYYY-MM-DD HH:mm:ss')
    })
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
