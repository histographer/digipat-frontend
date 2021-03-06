export default {
  namespaced: true,

  state() {
    return {
      currentPage: 1,
      perPage: 10,
      openedDetails: [],
      queuedForAnalysis: [],
      annotationsAddedForAnalysis: [],
    };
  },

  mutations: {
    setSearchString(state, searchString) {
      state.searchString = searchString;
    },

    setFiltersOpened(state, value) {
      state.filtersOpened = value;
    },

    setFilter(state, {filterName, propValue}) {
      state.filters[filterName] = propValue;
    },

    setCurrentPage(state, page) {
      state.currentPage = page;
    },

    setPerPage(state, perPage) {
      state.perPage = perPage;
    },

    setSortField(state, field) {
      state.sortField = field;
    },

    setSortOrder(state, order) {
      state.sortOrder = order;
    },

    setOpenedDetails(state, value) {
      state.openedDetails = value;
    },

    setQueuedImages(state, value) {
      state.queuedForAnalysis = value;
    },

    removeFirstFromAnalysisQueue(state) {
      state.queuedForAnalysis.shift();
    },

    addAnnotationForAnalysis(state, value) {
      state.annotationsAddedForAnalysis.push(value);
    },

    resetAnnotations(state) {
      state.annotationsAddedForAnalysis = [];
    },
  },
  actions: {
    startNewAnalysis ({ commit }, newQueue) {
      commit('setQueuedImages', newQueue);
      commit('resetAnnotations');
    },
  },
  getters: {
    nbActiveFilters: state => {
      return Object.values(state.filters).filter(val => val && val.length > 0).length; // count the number of not null values
    }
  }
};
