<template>
  <div class="report-wrapper d-flex flex-column h-100 bg-white">
    <header class="p-3 sticky-top bg-white z-2 shadow-sm">
      <div
        class="t-wrapper w-100 mx-auto"
        style="height: 44px; max-width: 400px; --t-width: 50%"
      >
        <div
          class="t-active-bg"
          :style="{
            transform: `translateX(${currentTab === 'calendar' ? '0' : '100'}%)`,
          }"
        ></div>
        <button
          class="t-btn t-push fw-bold"
          :class="{ active: currentTab === 'calendar' }"
          @click="currentTab = 'calendar'"
        >
          🗓️ 달력
        </button>
        <button
          class="t-btn t-push fw-bold"
          :class="{ active: currentTab === 'chart' }"
          @click="currentTab = 'chart'"
        >
          📊 차트 분석
        </button>
      </div>
    </header>

    <main class="flex-grow-1 overflow-auto">
      <transition name="fade-slide" mode="out-in">
        <ReportCalendar v-if="currentTab === 'calendar'" />
        <ReportChart v-else />
      </transition>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ReportCalendar from '@/sides/report-calendar.vue';
import ReportChart from '@/sides/report-chart.vue';

const currentTab = ref('calendar'); // 'calendar' or 'chart'
</script>

<style scoped>
/* 이전 정렬 버튼 스타일 재활용 */
.t-wrapper {
  position: relative;
  display: flex;
  background-color: #f1f3f5;
  border-radius: 12px;
  padding: 4px;
}
.t-active-bg {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(var(--t-width) - 4px);
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.t-btn {
  flex: 1;
  border: none;
  background: transparent;
  z-index: 1;
  color: #868e96;
  font-size: 14px;
  transition: color 0.3s;
}
.t-btn.active {
  color: #212529;
}
</style>
