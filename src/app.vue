<template>
    <div>
        <h3 :class="{active: isActive}" @click="handleClick">Hello Web</h3>
    </div>
</template>

<script>
export default {
    name: 'index',
    data: () => ({
        isActive: false
    }),
    methods: {
        handleClick () {
            this.isActive = true;
        }
    }
};
</script>

<style lang="scss">
h3 {
    color: red;

    &.active {
        color: blue;
    }
}
</style>
