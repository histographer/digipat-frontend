<template>
  <div class="content-wrapper">
    <div class="panel">
      <div class="panel-heading">
        <p>'GroupName' Group Results</p>
      </div>
      <div class="panel-block">
        <template v-if="analyses" v-for="analysis in analyses">
          <div :key="analysis.id">
            <div class="results_grid">
              <div class="results_method">
                <b-table
                  v-if="analysis.annotations"
                  :data="analysis.annotations"
                >
                  <template #default="{row: annotation}">
                    <b-table-column label="H" width="90" centered>
                      <p>Mean: {{ annotation.results.he.H.mean }}</p>
                      <p>Std: {{ annotation.results.he.H.std }}</p>
                    </b-table-column>

                    <b-table-column label="E" width="90" centered>
                      <p>Mean: {{ annotation.results.he.E.mean }}</p>
                      <p>Std: {{ annotation.results.he.E.std }}</p>
                    </b-table-column>
                  </template>
                </b-table>
              </div>
              <div class="results_method">

              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnnotationGroupResults',
  data() {
    return {
      group: {},
      analyses: [],
      loading: false,
    };
  },
  methods: {
    async getGroup() {
      const getInfo = await fetch(`http://localhost:9292/analysisInformation?annotationGroupId=${this.$router.history.current.params.idGroup}`);
      const response = await getInfo.json();
      return response.analyses;
    },
    async getResults() {
      for (let analysis of this.analyses) {
        if (analysis.status !== 'pending' && analysis.status !== 'failure') {
          const getResults = await fetch(`http://localhost:9292/analysisResult?analysisId=${analysis.analysisId}`);
          const response = getResults.json();
          analysis.annotations = response.annotations;
        }
      }
    },
  },
  async created() {
    let analyses = await this.getGroup();
    const annotations = [
      {
        annotationId: 'ididididid',
        results: {
          he: {
            H: {
              mean: -0.4941735897897377,
              std: 0.04383346025184383
            },
            E: {
              mean: 0.20421988842343536,
              std: 0.012792263926458863
            }
          }
        },
      },
      {
        annotationId: 'asdasjfhk',
        results: {
          he: {
            H: {
              mean: -0.8941735897897377,
              std: 0.02383346025184383
            },
            E: {
              mean: 0.40421988842343536,
              std: 0.022792263926458863
            }
          }
        },
      },
      {
        annotationId: 'asdasjfhk',
        results: {
          he: {
            H: {
              mean: -0.8941735897897377,
              std: 0.02383346025184383
            },
            E: {
              mean: 0.40421988842343536,
              std: 0.022792263926458863
            }
          }
        },
      },
      {
        annotationId: 'asdasjfhk',
        results: {
          he: {
            H: {
              mean: -0.8941735897897377,
              std: 0.02383346025184383
            },
            E: {
              mean: 0.40421988842343536,
              std: 0.022792263926458863
            }
          }
        },
      },
      {
        annotationId: 'asdasjfhk',
        results: {
          he: {
            H: {
              mean: -0.8941735897897377,
              std: 0.02383346025184383
            },
            E: {
              mean: 0.40421988842343536,
              std: 0.022792263926458863
            }
          }
        },
      }];
    for (let analysis of analyses) {
      analysis.status = 'success';
      analysis.annotations = annotations;
    }
    this.analyses = analyses;
    this.loading = false;
  }
};
</script>

<style scoped>

</style>
