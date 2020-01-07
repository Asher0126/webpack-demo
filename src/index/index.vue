<template>
    <div>
        <ul>
            <li class="ico-l1" />
            <li class="ico-l2" />
            <li class="ico-l3" />
            <li class="ico-l4" />
        </ul>
    </div>
</template>

<script>
export default {
    name: 'Index'
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
