<template>
<div class="okr">
  <q-ajax-bar
    ref="bar"
    position="top"
    color="red"
    size="10px"
    skip-hijack
  />
  <slot name="headerTop">
    <HeaderTop :navList="navList" :funName="funName" :teamName="user.teamName"></HeaderTop>
  </slot>
  <div class="year-quarter">
    <!--<q-btn color="primary" label="add kokr" @click="dialogKeyList = true" />-->
    <q-select dense class="okr-select" v-model="selectYear" :options="optionsYear" />
    <q-select dense item-aligned class="okr-select" v-model="selectQuarter" :options="optionsQuarter" />
    <q-btn v-if="user.role === 0" icon="add" color="white" text-color="black" label="新增O" @click="displaySelectPeople = true" />
    <!--<q-btn v-if="tellDateEdit && user.role !== 2" icon="code" label="待我审批" class="q-ml-md" @click="getUserList(user._id)" disabled>-->
      <!--<q-tooltip content-class="bg-black">功能开发中</q-tooltip>-->
    <!--</q-btn>-->
  </div>
  <div>
    <q-splitter
      v-model="splitterModel"
      style="height: 400px"
    >

      <template v-slot:before>
        <div class="q-pa-md">
          <q-tree
            :nodes="os"
            node-key="id"
            label-key="label"
            selected-color="primary"
            :selected.sync="selected"
            default-expand-all
          >
            <template v-slot:default-header="prop">
              <div class="row items-center">
                <q-icon :name="prop.node.icon || 'filter_1'" color="black" size="28px" class="q-mr-sm" />
                <div class="text-weight-bold">{{ prop.node.label }}</div>
              </div>
            </template>

            <template v-slot:default-body="prop">
              <div v-if="prop.node.confidence">
                <span class="text-weight-bold">信心指数</span>: <span class="text-weight-bold text-red">{{ prop.node.confidence }}</span>
                <span class="text-weight-bold">进度</span>: <span class="text-weight-bold text-red">{{ prop.node.progress }}</span>
                <span class="text-weight-bold">权重</span>: <span class="text-weight-bold text-red">{{ prop.node.weight }}</span>
              </div>
            </template>

          </q-tree>
        </div>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="selected"
          animated
          transition-prev="jump-up"
          transition-next="jump-up"
        >
          <q-tab-panel v-for="(item, index) in flatOs"
                       v-bind:key="index"
                       :name="item.id">
            <div class="text-h6">{{ item.label }}</div>
            <div v-if="item.flag === 0">
              <div>
                目标负责人:
                <q-chip outline square color="primary" text-color="white" style="margin-right: 5px;margin-bottom: 5px;">
                  {{ item.leader }}
                </q-chip>
              </div>
              <div>
                <q-btn v-if="user._id === item.leader" icon="add" color="white" text-color="black" label="新增KR" @click="displayKR = true" style="margin-right: 5px;margin-bottom: 5px;" />
                <q-btn v-if="user._id === item.leader" icon="flip_camera_android" color="white" text-color="black" label="更新周报" @click="displayWeekly = true" style="margin-right: 5px;margin-bottom: 5px;" />
              </div>
              <div v-if="item.weekly && item.weekly.week" style="margin-top: 10px;">
                <p><span style="font-size: 18px; font-weight: bold;">{{ item.weekly.week }}</span><span style="color: #ccc;margin-left:10px;">更新于{{ item.weekly.create_time }}</span></p>
                <div>
                  <div class="text-subtitle2">本周完成任务</div>
                  <div v-for="(itemSummary, index) in item.weekly.summary.split('\n')" v-bind:key="index" class="show-energy-desc-p">
                    <span style="font-size: 14px; font-weight: 300;">● {{ itemSummary }}</span>
                  </div>
                </div>
                <div>
                  <div class="text-subtitle2">下周计划任务</div>
                  <div v-for="(itemPp, index) in item.weekly.summary.split('\n')" v-bind:key="index" class="show-energy-desc-p">
                    <span style="font-size: 14px; font-weight: 300;">● {{ itemPp }}</span>
                  </div>
                </div>
              </div>
              <div v-if="!item.weekly" style="margin-top: 10px;">
                <div class="text-subtitle2">周报暂未更新</div>
              </div>
            </div>
            <div v-if="item.flag === 1">
              <div>参与人员</div>
              <q-chip v-for="(itemM, index) in item.member" v-bind:key="index" outline square color="primary" text-color="white" style="margin-right: 5px;margin-bottom: 5px;">
                {{ itemM }}
              </q-chip>
              <q-btn v-if="user._id === item.leader" icon="add" color="white" text-color="black" label="新增O" @click="displaySelectPeople = true" />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
  <slot name="footerTop">
    <FooterTop></FooterTop>
  </slot>
  <q-dialog v-model="displaySelectPeople"
            persistent
            :maximized="maximizedToggle"
            transition-show="slide-up"
            transition-hide="slide-down">
    <q-card>
      <q-bar>
        <q-icon name="data_saver_on" />
        <div>新增关键结果及其负责人</div>
        <q-space />

        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pt-none">
        <q-form @submit="saveOByAxios">
          <q-field
            borderless
            class="form-field">
            <q-input label="目标O"
                     type="text"
                     class="full-width"
                     v-model="oForm.name"
                     lazy-rules
                     :rules="[ val => val && val.length > 4 || '长度不得小于5']" />
          </q-field>
          <q-field
            class="form-field"
            borderless>
            <q-select
              v-model="selectOPeople"
              use-chips
              label="选择负责人"
              :options="leaderOptions"
              @filter="getUserListOptionsByAxios"
              style="width: 150px;"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    无
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-field>

          <div class="group-button">
            <q-btn
              type="submit"
              :loading="loadingSaveO"
              color="primary">
              保存
              <template v-slot:loading>
                <q-spinner-hourglass slot="loading" size="20px" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="displayWeekly"
            persistent
            :maximized="maximizedToggle"
            transition-show="slide-up"
            transition-hide="slide-down">
    <q-card>
      <q-bar>
        <q-icon name="flip_camera_android" />
        <div>更新周报</div>
        <q-space />

        <q-btn dense flat icon="close" v-close-popup @click="clearWeeklyForm">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pt-none">
        <q-form @submit="saveWeeklyByAxios">
          <q-field
            borderless
            class="form-field">
            <q-input label="本周完成任务"
                     type="textarea"
                     class="full-width"
                     v-model="wForm.summary"
                     lazy-rules
                     :rules="[ val => val && val.length > 4 || '长度不得小于5']" />
          </q-field>
          <q-field
            borderless
            class="form-field">
            <q-input label="下周计划任务"
                     type="textarea"
                     class="full-width"
                     v-model="wForm.plan"
                     lazy-rules
                     :rules="[ val => val && val.length > 4 || '长度不得小于5']" />
          </q-field>

          <div class="group-button">
            <q-btn
              type="submit"
              :loading="loadingSaveWeekly"
              color="primary">
              保存
              <template v-slot:loading>
                <q-spinner-hourglass slot="loading" size="20px" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="displayKR"
            persistent
            :maximized="maximizedToggle"
            transition-show="slide-up"
            transition-hide="slide-down">
    <q-card>
      <q-bar>
        <q-icon name="add_task" />
        <div>新增KR</div>
        <q-space />

        <q-btn dense flat icon="close" v-close-popup @click="clearKRForm">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section class="q-pt-none" style="margin-top: 15px;">
        <q-form @submit="saveKRByAxios">
          <div v-for="(item, index) in krForm"
               v-bind:key="index">
            <p>关键结果KR{{ index + 1 }}</p>
            <q-field
              borderless
              class="form-field">
              <q-input square outlined
                       label="关键结果"
                       type="text"
                       class="full-width"
                       v-model="item.kr"
                       lazy-rules
                       :rules="[ val => val && val.length > 4 || '长度不得小于5']" />
            </q-field>
            <q-field
              borderless
              class="form-field float-left on-left">
              <q-input square outlined
                       label="进度"
                       type="number"
                       class=""
                       v-model.number="item.progress"
                       lazy-rules
                       :rules="[val => val !== null && val !== '' || '不能为空']" />
            </q-field>
            <q-field
              borderless
              class="form-field float-left on-left">
              <q-input square outlined
                       label="权重"
                       type="number"
                       class=""
                       v-model.number="item.weight"
                       lazy-rules
                       :rules="[val => val !== null && val !== '' || '不能为空']" />
            </q-field>
            <q-field
              borderless
              class="form-field">
              <q-input square outlined
                       label="信心指数"
                       type="number"
                       color="white"
                       bg-color="red"
                       class=""
                       v-model.number="item.confidence"
                       lazy-rules
                       :rules="[val => val !== null && val !== '' || '不能为空']" />
            </q-field>
          </div>

          <q-btn v-if="krForm.length < 5" icon="add" color="white" text-color="black" label="新增KR" @click="addKRForm" />

          <div class="group-button">
            <q-btn
              type="submit"
              class="full-width"
              :loading="loadingSaveKR"
              color="primary">
              保存
              <template v-slot:loading>
                <q-spinner-hourglass slot="loading" size="20px" />
              </template>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</div>
</template>

<script>
// import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { date } from 'quasar'
import HeaderTop from '../layouts/common/header'
import FooterTop from '../layouts/common/footer'
export default {
  name: 'Okr',
  data () {
    return {
      navList: [{
        label: 'HOME', toLink: 'https://luolinjia.com/tt/#/console'
      }, {
        label: 'OKR', toLink: '/okr'
      }],
      funName: 'OKR',
      user: undefined,
      splitterModel: 50,
      selected: 'oid',
      flatOs: [],
      os: [],
      osBak: [
        {
          label: 'OneNET与移动云打通',
          icon: 'filter_1',
          children: [
            {
              label: '完成需求文档',
              icon: 'looks_one',
              progress: 25,
              weight: 25,
              confidence: 7
            },
            {
              label: '完成祥设',
              icon: 'looks_two'
            },
            {
              label: '进入开发阶段,开发达到40%',
              icon: 'looks_3'
            }
          ]
        },
        {
          label: 'xxx',
          icon: 'filter_2',
          children: [
          ]
        }
      ],
      displaySelectPeople: false,
      displayWeekly: false,
      displayKR: false,
      selectYear: '',
      selectQuarter: 'Q1',
      optionsYear: [],
      optionsQuarter: ['Q1', 'Q2', 'Q3', 'Q4'],
      oForm: {
        id: '',
        name: '',
        leader: null,
        label: null
      },
      selectOPeople: null,
      leaderOptions: [],
      maximizedToggle: true,
      loadingSaveO: false,
      loadingSaveWeekly: false,
      loadingSaveKR: false,
      wForm: {
        id: '',
        summary: '',
        plan: ''
      },
      krForm: [{
        id: '',
        kr: '',
        progress: '',
        weight: '',
        confidence: ''
      }, {
        id: '',
        kr: '',
        progress: '',
        weight: '',
        confidence: ''
      }]
    }
  },
  validations: {
  },
  components: { HeaderTop, FooterTop },
  created () {
    this.init()
  },
  watch: {
    selectYear: function () {
      this.init()
    },
    selectQuarter: function () {
      this.init()
    }
  },
  methods: {
    init () {
      const _this = this
      _this.user = JSON.parse(localStorage.getItem('user'))
      _this.renderYearAndQuarter()
      _this.getIndexDataByAxios()
    },
    renderTabPanel () {
      const _this = this
      for (let i = 0, iSize = _this.os.length; i < iSize; i++) {
        let itemI = {
          label: _this.os[i].label,
          flag: 0,
          id: _this.os[i].id,
          leader: _this.os[i].leader,
          weekly: _this.os[i].weekly
        }
        _this.flatOs.push(itemI)
        for (let j = 0, jSize = _this.os[i].children.length; j < jSize; j++) {
          let itemJ = { label: _this.os[i].children[j].label, flag: 1, member: _this.os[i].children[j].member, id: _this.os[i].children[j].id }
          _this.flatOs.push(itemJ)
        }
      }
    },
    renderYearAndQuarter () {
      let year = date.formatDate(Date.now(), 'YYYY')
      // let quarter = date.formatDate(Date.now(), 'Q')
      const _this = this

      for (let i = 2021; i <= parseInt(year); i++) {
        _this.optionsYear.push(i + '')
      }
      _this.selectYear = year
      // _this.selectQuarter = 'Q' + quarter
    },
    renderUserList (data) {
      let reData = []
      for (let i = 0, size = data.length; i < size; i++) {
        reData.push({ label: data[i].name, value: data[i]._id })
      }
      return reData
    },
    renderTreeData (data) {
      const _this = this
      let reData = [], fieldQ = _this.selectYear + '年' + _this.selectQuarter
      for (let i = 0, size = data.list.length; i < size; i++) {
        let oItem = data.list[i]
        let oField = {
          id: oItem._id,
          leader: oItem.leader,
          label: oItem.name,
          icon: 'filter_' + (i + 1),
          weekly: oItem.weekly ? oItem.weekly : null,
          children: []
        }
        let kr = data.list[i][fieldQ]
        if (kr !== null) {
          let iconJ
          for (let j in kr) {
            if (parseInt(j) === 0) iconJ = 'one'
            if (parseInt(j) === 1) iconJ = 'two'
            let jItem = kr[j]
            oField.children.push({
              id: jItem.title,
              label: jItem.title || '无',
              icon: 'looks_' + (j > 1 ? (parseInt(j) + 1) + '' : iconJ),
              progress: jItem.progress + '%',
              weight: jItem.weight + '%',
              confidence: jItem.faith,
              member: jItem.member
            })
          }
        } else {
        }
        reData.push(oField)
      }
      return reData
    },
    getUserListOptionsByAxios (val, update, abort) {
      const _this = this
      _this.$axios.get('/api/memberlist').then((res) => {
        if (res.data.code === 0 && res.data.data.length > 0) {
          update(() => {
            _this.leaderOptions = _this.renderUserList(res.data.data)
          })
        }
      }).catch((error) => {
        _this.handleError(error)
      })
    },
    getIndexDataByAxios () {
      const _this = this
      _this.$axios.get('/api/index?year=' + _this.selectYear + '&quarter=' + _this.selectQuarter).then((res) => {
        if (res.data.code === 0) {
          _this.os = _this.renderTreeData(res.data.data)
          _this.renderTabPanel()
        }
      }).catch((error) => {
        _this.handleError(error)
      })
    },
    addKRForm () {
      const _this = this
      _this.krForm.push({
        id: '',
        kr: '',
        progress: '',
        weight: '',
        confidence: ''
      })
    },
    saveOByAxios () {
      const _this = this
      _this.oForm.leader = _this.selectOPeople.value
      _this.oForm.label = _this.selectOPeople.label
      _this.loadingSaveO = true
      _this.$axios.post('/api/target/save', _this.oForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingSaveO = false
          _this.displaySelectPeople = false
          _this.$q.notify({
            message: '新增目标O成功',
            color: 'positive',
            position: 'top'
          })
          _this.clearOForm()
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    saveWeeklyByAxios () {
      const _this = this
      _this.wForm.id = _this.selected
      _this.loadingSaveWeekly = true
      _this.$axios.post('/api/weekly/save', _this.wForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingSaveWeekly = false
          _this.displayWeekly = false
          _this.$q.notify({
            message: '更新周报成功',
            color: 'positive',
            position: 'top'
          })
          _this.clearWeeklyForm()
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    saveKRByAxios () {
      const _this = this

      let submitKRForm = {
        id: _this.selected
      }

      submitKRForm.result = {}
      submitKRForm.result[_this.selectQuarter] = []
      for (let i = 0, size = _this.krForm.length; i < size; i++) {
        let item = _this.krForm[i]
        submitKRForm.result[_this.selectQuarter].push({
          title: item.kr,
          progress: item.progress,
          weight: item.weight,
          faith: item.confidence
        })
      }

      console.log(submitKRForm)
      _this.loadingSaveKR = true
      _this.$axios.post('/api/target/kr', submitKRForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingSaveKR = false
          _this.displayKR = false
          _this.$q.notify({
            message: '新增关键成果KR成功',
            color: 'positive',
            position: 'top'
          })
          _this.clearKRForm()
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    clearOForm () {
      this.oForm = {
        id: '',
        name: '',
        leader: null,
        label: null,
        team: ''
      }
    },
    clearWeeklyForm () {},
    clearKRForm () {
      this.krForm = [{ id: '', kr: '', progress: '', weight: '', confidence: '' }, { id: '', kr: '', progress: '', weight: '', confidence: '' }]
    },
    handleError (error) {
      let isExpired = error.response.data.error === 'jwt expired'
      if (error.response.status !== 500) {
        this.$q.notify({
          message: isExpired ? 'token已过期,重新登录' : error.response.data.error,
          timeout: 3000,
          type: 'negative',
          position: 'top',
          actions: isExpired ? [{
            label: '登录',
            handler: () => {
              this.$router.push('/login')
            }
          }] : null
        })

        if (isExpired) {
          setTimeout(() => {
            this.$router.push('/login')
          }, 1000)
        }
      } else {
        this.loading = false
        this.$q.dialog({
          title: error.response.status + '',
          message: error.response.data.message
        })
      }
    }
  }
}
</script>

<style scoped lang="less">
.okr {
  margin: 0 auto;
  max-width: 76%;
  min-width: 800px;
  position: relative;
  margin-top: 300px;
  .bread {
    position: absolute;
    left:-8px;
    top: -60px;
    margin: 0;
  }
  .form-field {
    margin-top: 15px 20px 0 0;
    display: inline-block;
  }
  .group-button {
    vertical-align: baseline;
    margin-top: 10px;
  }
  .okr-select {
    width: 100px;
    font-size: 16px;
    display: inline-block;
  }
  .year-month {
    margin-bottom: 10px;
  }
  .item-plan {
    display: inline-block;
    width: 50%;
  }
  .show-kv-p {
    margin-top: 10px;
  }
  .show-energy-desc-p {
    margin-left: 10px;
    margin-bottom: 0;
  }
  .value-btns {
    margin-bottom: 10px;
  }
  .d-add-o {
    width: 300px;
    height: 150px;
  }
  .full-width {
    margin-top: 15px;
  }
}
</style>
