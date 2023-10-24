import { defineStore } from 'pinia';
type MemberViewState = {
  tab: string;
};
const useMemberViewStore = defineStore('memberView', {
  state(): MemberViewState {
    return {
      tab: '',
    };
  },
  actions: {
    setTab(tab: string) {
      this.tab = tab;
    },
  },
});

export default useMemberViewStore;
