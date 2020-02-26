<template>
<div class="okr">
  <slot name="headerTop">
    <HeaderTop :navList="navList" :funName="funName" :teamName="teamName"></HeaderTop>
  </slot>
  <div class="year-month">
    <!--<q-btn color="primary" label="add kokr" @click="dialogKeyList = true" />-->
    <q-select dense class="okr-select" v-model="selectYear" :options="optionsYear" :display-value="`${selectYear ? selectYear : '*none*'}年`" />
    <q-select dense item-aligned class="okr-select" v-model="selectMonth" :options="optionsMonth" :display-value="`${selectMonth ? selectMonth : '*none*'}月`" />
  </div>
  <q-list bordered>
    <q-expansion-item
      v-for="(item, index) in userList"
      v-bind:key="index"
      icon="view_comfy"
      expand-separator
      header-class=""
      class=""
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="view_comfy" text-color="grey-8" />
        </q-item-section>
        <q-item-section>
          <span>
            <span style="display: inline-block; width: 100px;">{{ item.name }}</span>
            <span v-if="!item.kokrData.content" style="color: white; background: red; margin: 0 10px; padding: 0 10px;">KEY</span>
            <span v-if="!item.vokrData.content" style="color: white; background: red; margin: 0 10px; padding: 0 10px;">VALUE</span>
          </span>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <!--<q-icon name="star" color="red" size="24px" />-->
            <!--<q-icon name="star" color="red" size="24px" />-->
            <!--<q-icon name="star" color="red" size="24px" />-->
          </div>
        </q-item-section>
      </template>
      <q-card class="item-plan">
        <q-card-section>
          {{ selectYear }}年{{ selectMonth }}月 key
          <q-btn v-if="!item.kokrData.content && item.name === user.name" icon="add" class="full-width" @click="getKeyItemData(item)" />
          <q-btn v-if="item.kokrData.content && item.name === user.name" icon="edit" class="full-width" @click="getKeyItemData(item)" />
          <q-btn v-if="item.kokrData.content && item.name !== user.name" icon="trending_flat" class="full-width" @click="getKeyItemData(item)" />
          <p v-for="(itemP, index) in item.kokrData.content" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
            {{ itemP.title }}
          </p>
        </q-card-section>
      </q-card>
      <q-card class="item-plan">
        <q-card-section>
          {{ selectYear }}年{{ selectMonth }}月 value
          <q-btn v-if="!item.vokrData.content && item.name === user.name" icon="add" class="full-width" @click="getValueItemData(item)" />
          <q-btn v-if="item.vokrData.content && item.name === user.name" icon="edit" class="full-width" @click="getValueItemData(item)" />
          <q-btn v-if="item.vokrData.content && item.name !== user.name" icon="trending_flat" class="full-width" @click="getValueItemData(item)" />
          <p v-for="(itemP, index) in item.vokrData.content" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
            {{ itemP.title }}
          </p>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
  <slot name="footerTop">
    <FooterTop></FooterTop>
  </slot>
  <q-dialog
    v-model="dialogKeyList"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="">
      <q-bar>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup @click="renderUserList">
          <q-tooltip>关闭</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">『 {{ selectName }} 』{{ selectYear }}年{{ selectMonth }}月 KEY</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-if="showSelfButton">
          <q-btn label="新增" @click="dialogKeyItem = true" />
          <q-btn label="保存" :loading="loadingOkr" @click="addKokr" />
        </div>
        <br>
        <q-list bordered class="rounded-borders">
          <q-table
            :data="kokrListForm.content"
            :columns="columns"
            :pagination.sync="paginationControl"
          >

            <q-tr slot="body" slot-scope="props" :props="props">
              <!--<q-td key="name" :props="props" width="25%">-->
                <!--{{ props.row.name }}-->
              <!--</q-td>-->
              <q-td key="kind" :props="props" width="25%">
                <div v-if="props.row.kind === '1'">工作目标</div>
                <div v-if="props.row.kind === '2'">额外目标</div>
              </q-td>
              <q-td key="title" :props="props" width="25%">
                {{ props.row.title }}
              </q-td>
              <q-td key="percent" :props="props" width="25%">
                {{ props.row.percent }}
              </q-td>
              <q-td key="op" :props="props" width="25%">
                <q-btn flat color="primary" icon="visibility" @click="renderKeyItemDetailDialog(props.row)">VIEW</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="edit" @click="openDialog4editKokrListForm(props.row)">EDIT</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="delete" @click="openDialog4delKokrListForm(props.row)">EDIT</q-btn>
              </q-td>
            </q-tr>
          </q-table>

        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogKeyItem" persistent transition-show="scale" transition-hide="scale">
    <q-card class="" style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ isEdit4KeyItem ? '编辑' : '新增' }}Key</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-field
          borderless
          class="form-field">
          <q-radio v-model="kokrForm.kind" val="1" label="工作目标" />
          <q-radio v-model="kokrForm.kind" val="2" label="额外目标" />
        </q-field>
        <q-field
          borderless
          label="权重"
          class="form-field">
          <q-slider v-model="kokrForm.percent" :min="0" :max="100"
                    label
                    label-always/>
        </q-field>
        <q-field
          class="form-field"
          :error="$v.kokrForm.title.$error"
          :error-message="$v.kokrForm.title.minLength ? errMessage.requireInfo : errMessage.minInfo">
          <q-input label="内容"
                   type="text"
                   class="full-width"
                   @input="$v.kokrForm.title.$touch"
                   v-model="kokrForm.title" />
        </q-field>
        <q-field
          class="form-field"
          :error="$v.kokrForm.desc.$error"
          :error-label="$v.kokrForm.desc.maxLength ? errMessage.requireInfo : errMessage.maxInfo">
          <q-input label="任务详细描述"
                   type="textarea"
                   class="full-width"
                   @input="$v.kokrForm.desc.$touch"
                   v-model="kokrForm.desc" />
        </q-field>

        <div class="group-button">
          <q-btn
            :loading="loadingOkr"
            color="primary"
            @click="saveKeyOkr">
            保存
            <q-spinner-hourglass slot="loading" size="20px" />
            <span slot="loading">Loading...</span>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogKeyItemDetail" persistent transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">『 {{ dialogKeyItemDetailTask }} 』的任务描述</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <p v-for="(itemP, index) in dialogKeyItemDetailDesc.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
          {{ itemP }}
        </p>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="dialogValueList"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="">
      <q-bar>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup @click="renderUserList">
          <q-tooltip>关闭</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <div class="text-h6">『 {{ selectName }} 』{{ selectYear }}年{{ selectMonth }}月 VALUE</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div v-if="showSelfButton">
          <q-btn label="新增" @click="dialogValueItem = true" />
          <q-btn label="保存" :loading="loadingOkr" @click="addVokr" />
        </div>
        <br>
        <q-list bordered class="rounded-borders">
          <q-table
            :data="vokrListForm.content"
            :columns="columnsValue"
            :pagination.sync="paginationControl"
          >
            <q-tr slot="body" slot-scope="props" :props="props">
              <!--<q-td key="name" :props="props" width="25%">-->
              <!--{{ props.row.name }}-->
              <!--</q-td>-->
              <q-td key="kind" :props="props" width="25%">
                <div v-if="props.row.kind === '1'">工作目标</div>
                <div v-if="props.row.kind === '2'">额外目标</div>
              </q-td>
              <q-td key="title" :props="props" width="25%">
                {{ props.row.title }}
              </q-td>
              <q-td key="percent" :props="props" width="15%">
                {{ props.row.percent }}
              </q-td>
              <q-td key="score" :props="props" width="10%">
                {{ props.row.score }}
              </q-td>
              <q-td key="op" :props="props" width="25%">
                <q-btn flat color="primary" icon="visibility" @click="renderValueItemDetailDialog(props.row)">VIEW</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="edit" @click="openDialog4editVokrListForm(props.row)">EDIT</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="delete" @click="openDialog4delVokrListForm(props.row)">EDIT</q-btn>
              </q-td>
            </q-tr>
          </q-table>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogValueItem" persistent transition-show="scale" transition-hide="scale">
    <q-card class="" style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ isEdit4ValueItem ? '编辑' : '新增' }}Key</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-field
          borderless
          class="form-field">
          <q-radio v-model="vokrForm.kind" val="1" label="工作目标" />
          <q-radio v-model="vokrForm.kind" val="2" label="额外目标" />
        </q-field>
        <q-field
          borderless
          label="权重"
          class="form-field">
          <q-slider v-model="vokrForm.percent" :min="0" :max="100"
                    label
                    label-always/>
        </q-field>
        <q-field
          class="form-field"
          :error="$v.vokrForm.title.$error"
          :error-message="$v.vokrForm.title.minLength ? errMessage.requireInfo : errMessage.minInfo">
          <q-input label="内容"
                   type="text"
                   class="full-width"
                   @input="$v.vokrForm.title.$touch"
                   v-model="vokrForm.title" />
        </q-field>
        <q-field
          class="form-field"
          :error="$v.vokrForm.desc.$error"
          :error-label="$v.vokrForm.desc.maxLength ? errMessage.requireInfo : errMessage.maxInfo">
          <q-input label="任务详细描述"
                   type="textarea"
                   class="full-width"
                   @input="$v.vokrForm.desc.$touch"
                   v-model="vokrForm.desc" />
        </q-field>
        <q-field
          borderless
          label="分数"
          class="form-field">
          <q-slider v-model="vokrForm.score" :min="0" :max="100"
                    label
                    label-always/>
        </q-field>

        <div class="group-button">
          <q-btn
            :loading="loadingOkr"
            color="primary"
            @click="saveValueOkr">
            保存
            <q-spinner-hourglass slot="loading" size="20px" />
            <span slot="loading">Loading...</span>
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</div>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
// import { Dialog } from 'quasar'
import HeaderTop from '../layouts/common/header'
import FooterTop from '../layouts/common/footer'
export default {
  name: 'Okr',
  data () {
    return {
      navList: [{
        label: 'HOME', toLink: '/console'
      }, {
        label: 'OKR', toLink: '/okr'
      }],
      funName: '月报OKR',
      teamName: '门户+ 团队',
      user: undefined,
      loadingOkr: false,
      dialogKeyList: false,
      dialogKeyItem: false,
      dialogKeyItemDetail: false,
      dialogKeyItemDetailDesc: '',
      dialogKeyItemDetailTask: '',
      isEdit4KeyItem: false,
      dialogValueList: false,
      dialogValueItem: false,
      dialogValueItemDetail: false,
      dialogValueItemDetailDesc: '',
      dialogValueItemDetailTask: '',
      isEdit4ValueItem: false,
      showSelfButton: false,
      selectName: '',
      selectYear: '2020',
      selectMonth: '2',
      maximizedToggle: true,
      userList: [],
      kokrListForm: {
        creator: '',
        team: '',
        year: '',
        month: '',
        content: []
      },
      kokrForm: {
        kind: '1',
        title: '',
        percent: 20,
        desc: ''
      },
      vokrListForm: {
        creator: '',
        dealer: '',
        year: '',
        month: '',
        team: '',
        gscore: 100,
        grade: '',
        status: '',
        comment: '',
        comment_self: '',
        last_person: '',
        content: []
      },
      vokrForm: {
        kind: '1',
        title: '',
        percent: 20,
        score: 100,
        desc: ''
      },
      tableData4self: [],
      paginationControl: { rowsPerPage: 0, page: 1 },
      columns: [{
        name: 'kind',
        label: '类型',
        align: 'left',
        sortable: true,
        field: 'kind'
      }, {
        name: 'title',
        label: '内容',
        align: 'left',
        sortable: true,
        field: 'title'
      }, {
        name: 'percent',
        label: '权重',
        align: 'left',
        sortable: true,
        field: 'percent'
      }, {
        name: 'op',
        label: '操作',
        align: 'left',
        field: 'op'
      }],
      columnsValue: [{
        name: 'kind',
        label: '类型',
        align: 'left',
        sortable: true,
        field: 'kind'
      }, {
        name: 'title',
        label: '内容',
        align: 'left',
        sortable: true,
        field: 'title'
      }, {
        name: 'percent',
        label: '权重',
        align: 'left',
        sortable: true,
        field: 'percent'
      }, {
        name: 'score',
        label: '分数',
        align: 'left',
        sortable: true,
        field: 'score'
      }, {
        name: 'op',
        label: '操作',
        align: 'left',
        field: 'op'
      }],
      errMessage: {
        requireInfo: '必填',
        maxInfo: '任务名称不宜超过30个字符',
        minInfo: '内容最少5个字符',
        sameAsInfo: '输入的两次密码不一致'
      },
      year: '',
      month: '',
      optionsYear: [
        '2020'
      ],
      optionsMonth: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
    }
  },
  validations: {
    kokrForm: {
      kind: { required },
      title: { required, minLength: minLength(5) },
      percent: { required },
      desc: { required, maxLength: maxLength(512) }
    },
    vokrForm: {
      kind: { required },
      title: { required, minLength: minLength(5) },
      percent: { required },
      desc: { required, maxLength: maxLength(512) }
    }
  },
  components: { HeaderTop, FooterTop },
  created () {
    this.init()
  },
  watch: {
    selectYear: function () {
      this.getUserList()
    },
    selectMonth: function () {
      this.getUserList()
    }
  },
  methods: {
    init () {
      const _this = this
      _this.user = JSON.parse(localStorage.getItem('user'))
      _this.getUserList()
    },
    getUserList () {
      const _this = this

      _this.$axios.post('/weeklyreportapi/getUserList', {
        type: 'okr',
        team: _this.user.team,
        year: _this.selectYear,
        month: _this.selectMonth
      }).then((res) => {
        if (res.data.code === 0) {
          if (res.data.data.length > 0) {
            // _this.tableData = _this.rendertableData(res.data.data);
            _this.userList = res.data.data
          } else if (res.data.data.length === 0) {
            _this.userList = []
          }
        }
      }).catch((error) => {
        _this.handleError(error)
      })
    },
    saveKeyOkr () {
      const _this = this
      let formContent = _this.kokrListForm.content
      if (_this.isEdit4KeyItem) {
        formContent.forEach(e => {
          if (e._id === _this.kokrForm._id) {
            if (formContent.indexOf(e) > -1) {
              let i = formContent.indexOf(e)
              formContent.splice(i, 1)
            }
            formContent.push(_this.kokrForm)
            _this.isEdit4KeyItem = false
          }
        })
      } else {
        formContent.push(_this.kokrForm)
      }
      _this.dialogKeyItem = false
      _this.resetKokrForm()
    },
    addKokr () {
      // TODO 新增kokr的时候,需要判断选择的selectYear和selectMonth是否处于当前的时间段
      const _this = this
      _this.kokrListForm.creator = _this.user._id
      _this.kokrListForm.year = _this.selectYear
      _this.kokrListForm.month = _this.selectMonth

      _this.loadingOkr = true
      _this.$axios.post('/weeklyreportapi/kokr/add', _this.kokrListForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingOkr = false
          _this.dialogKeyItem = false
          _this.$q.notify({
            message: res.data.message,
            color: 'positive',
            position: 'top'
          })
          _this.getKeyItemData({ id: _this.user._id, team: _this.user.team, name: _this.user.name })
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    getKeyItemData (user) {
      const _this = this
      _this.selectName = user.name
      _this.showSelfButton = (user.id === _this.user._id)

      const params = {
        creator: user.id,
        team: user.team,
        year: _this.selectYear,
        month: _this.selectMonth
      }

      _this.$axios.post('/weeklyreportapi/kokr/getOkrByUserId', params).then((res) => {
        if (res.data.code === 0 && res.data.data.length > 0) {
          _this.kokrListForm.creator = res.data.data[0].creator
          _this.kokrListForm.team = res.data.data[0].team
          _this.kokrListForm.content = res.data.data[0].content
          _this.dialogKeyList = true
        } else {
          _this.kokrListForm.creator = _this.user._id
          _this.kokrListForm.team = _this.user.team
          _this.kokrListForm.content = []
          _this.dialogKeyList = true
          _this.$q.notify({
            message: '暂无数据',
            color: 'positive',
            position: 'top'
          })
        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    renderKeyItemDetailDialog (data) {
      const _this = this
      _this.dialogKeyItemDetailTask = data.title
      _this.dialogKeyItemDetailDesc = data.desc
      _this.dialogKeyItemDetail = true
    },
    openDialog4editKokrListForm (data) {
      const _this = this
      _this.isEdit4KeyItem = true
      _this.kokrForm = data
      _this.dialogKeyItem = true
    },
    openDialog4delKokrListForm (data) {
      const _this = this
      let formContent = _this.kokrListForm.content
      formContent.forEach(e => {
        if (e._id === data._id) {
          if (formContent.indexOf(e) > -1) {
            let i = formContent.indexOf(e)
            formContent.splice(i, 1)
          }
        }
      })
    },
    resetKokrForm () {
      const _this = this
      _this.kokrForm = {
        kind: '1',
        title: '',
        percent: 20,
        desc: ''
      }
    },
    renderUserList () {
      this.getUserList()
    },
    saveValueOkr () {
      const _this = this
      let formContent = _this.vokrListForm.content
      if (_this.isEdit4ValueItem) {
        formContent.forEach(e => {
          if (e._id === _this.vokrForm._id) {
            if (formContent.indexOf(e) > -1) {
              let i = formContent.indexOf(e)
              formContent.splice(i, 1)
            }
            formContent.push(_this.vokrForm)
            _this.isEdit4ValueItem = false
          }
        })
      } else {
        formContent.push(_this.vokrForm)
      }
      _this.dialogValueItem = false
      _this.resetVokrForm()
    },
    addVokr () {
      // TODO 新增vokr的时候,需要判断选择的selectYear和selectMonth是否处于当前的时间段
      const _this = this
      _this.vokrListForm.year = _this.selectYear
      _this.vokrListForm.month = _this.selectMonth
      _this.vokrListForm.team = _this.user.team
      _this.vokrListForm.last_person = _this.user._id
      _this.loadingOkr = true
      _this.$axios.post('/weeklyreportapi/vokr/add', _this.vokrListForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingOkr = false
          _this.dialogValueItem = false
          _this.$q.notify({
            message: res.data.message,
            color: 'positive',
            position: 'top'
          })
          _this.getValueItemData({ id: _this.user._id, team: _this.user.team, name: _this.user.name })
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    getValueItemData (user) {
      const _this = this
      _this.selectName = user.name
      _this.showSelfButton = (user.id === _this.user._id)

      const params = {
        creator: user.id,
        team: user.team,
        year: _this.selectYear,
        month: _this.selectMonth
      }

      _this.$axios.post('/weeklyreportapi/vokr/getValueOkrByUserId', params).then((res) => {
        if (res.data.code === 0 && res.data.data.length > 0) {
          _this.vokrListForm = res.data.data[0]
          _this.dialogValueList = true
        } else {
          _this.vokrListForm = {
            creator: _this.user._id,
            dealer: _this.user._id,
            year: _this.selectYear,
            month: _this.selectMonth,
            team: _this.user.team,
            gscore: 100,
            grade: '',
            status: '1',
            comment: '',
            comment_self: '',
            last_person: _this.user._id,
            content: []
          }
          _this.dialogValueList = true
          _this.$q.notify({
            message: '暂无数据',
            color: 'positive',
            position: 'top'
          })
        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    renderValueItemDetailDialog (data) {
      const _this = this
      _this.dialogValueItemDetailTask = data.title
      _this.dialogValueItemDetailDesc = data.desc
      _this.dialogValueItemDetail = true
    },
    openDialog4editVokrListForm (data) {
      const _this = this
      _this.isEdit4ValueItem = true
      _this.vokrForm = data
      _this.dialogValueItem = true
    },
    openDialog4delVokrListForm (data) {
      const _this = this
      let formContent = _this.vokrListForm.content
      formContent.forEach(e => {
        if (e._id === data._id) {
          if (formContent.indexOf(e) > -1) {
            let i = formContent.indexOf(e)
            formContent.splice(i, 1)
          }
        }
      })
    },
    resetVokrForm () {
      const _this = this
      _this.vokrForm = {
        kind: '1',
        title: '',
        percent: 20,
        desc: '',
        score: 100
      }
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
  .group-button {
    vertical-align: baseline;
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
}
</style>
