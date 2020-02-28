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
    <HeaderTop :navList="navList" :funName="funName" :teamName="teamName"></HeaderTop>
  </slot>
  <div class="year-month">
    <!--<q-btn color="primary" label="add kokr" @click="dialogKeyList = true" />-->
    <q-select dense class="okr-select" v-model="selectYear" :options="optionsYear" />
    <q-select dense item-aligned class="okr-select" v-model="selectMonth" :options="optionsMonth" />
    <q-btn v-if="tellDateEdit && user.role !== 2" icon="code" label="待我审批" class="q-ml-md" @click="getUserList(user._id)" disabled>
      <q-tooltip content-class="bg-black">功能开发中</q-tooltip>
    </q-btn>
  </div>
  <q-list bordered>
    <q-skeleton v-if="beforeShowUserList" height="350px" />
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
            <span style="display: inline-block; width: 100px; font-size: 16px;">{{ item.name }}</span>
            <span v-if="!item.kokrData.content && tellDateEdit && tellCurrentMonthShowKey" style="color: #fff; background: rgb(219, 40, 40); margin: 0 10px; padding: 0 10px;">KEY</span>
            <span v-if="!item.vokrData.content && tellDateEdit && tellNextMonthShowValue" style="color: #fff; background: rgb(219, 40, 40); margin: 0 10px; padding: 0 10px;">VALUE</span>
          </span>
        </q-item-section>

        <q-item-section side>
          <div class="row items-center">
            <span v-if="item.vokrData.status === '20'" style="font-size: 20px;">{{ item.vokrData.grade }} ( {{ item.vokrData.total_score }} )</span>
            <span v-if="item.vokrData.status !== '20' && tellDateEdit" style="font-size: 16px;">进行中</span>
          </div>
        </q-item-section>
      </template>
      <q-splitter
        v-model="splitterModel"
        style="height: 350px"
      >

        <template v-slot:before>
          <div class="q-pa-md">
            <div class="text-h4 q-mb-md">Key</div>
            <q-btn v-if="!item.kokrData.content && item.name === user.name && tellDateEdit && tellCurrentMonthShowKey" icon="add" class="full-width" @click="getKeyItemData(item)" />
            <q-btn v-if="item.kokrData.content && item.name === user.name && tellDateEdit && tellCurrentMonthShowKey" icon="edit" class="full-width" @click="getKeyItemData(item)" />
            <q-btn v-if="item.kokrData.content && item.name !== user.name && tellDateEdit && tellCurrentMonthShowKey" icon="trending_flat" class="full-width" @click="getKeyItemData(item)" />
            <div v-for="(itemP, index) in item.kokrData.content" :key="index" class="q-my-md show-kv-p">
              <span style="font-size: 16px; font-weight: 700;">● {{ itemP.title }}</span>
              <br>
              <div v-for="(itemPp, index) in itemP.desc.split('\n')" v-bind:key="index" class="show-energy-desc-p">
                <span style="font-size: 14px; font-weight: 300;">○ {{ itemPp }}</span>
              </div>
            </div>
          </div>
        </template>

        <template v-slot:after>
          <div class="q-pa-md">
            <div class="text-h4 q-mb-md">Value</div>
            <q-btn v-if="!item.vokrData.content && item.name === user.name && tellDateEdit && tellNextMonthShowValue" icon="add" class="full-width" @click="getValueItemData(item)" />
            <q-btn v-if="item.vokrData.content && (item.name === user.name || item.vokrData.dealer === user._id) && tellDateEdit && tellNextMonthShowValue" icon="edit" class="full-width" @click="getValueItemData(item)" />
            <q-btn v-if="item.vokrData.content && && (item.name !== user.name && item.vokrData.dealer !== user._id) && tellDateEdit && tellNextMonthShowValue" icon="trending_flat" class="full-width" @click="getValueItemData(item)" />
            <div v-for="(itemP, index) in item.vokrData.content" :key="index" class="q-my-md show-kv-p">
              <span style="font-size: 16px; font-weight: 700;">● {{ itemP.title }}</span>
              <br>
              <p v-for="(itemPp, index) in itemP.desc.split('\n')" v-bind:key="index" class="show-energy-desc-p">
                <span style="font-size: 14px; font-weight: 300;">○ {{ itemPp }}</span>
              </p>
            </div>
          </div>
        </template>

      </q-splitter>
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
        <div>
          <q-btn v-if="showSelfButton" icon="add" label="新增" @click="dialogKeyItem = true" style="margin-right: 10px;" />
          <q-btn v-if="showSelfButton" icon="done" label="保存" :loading="loadingOkr" @click="addKokr" />
        </div>
        <br>
        <q-list bordered class="rounded-borders">
          <q-skeleton v-if="beforeShowKokr" height="350px" />
          <q-table
            v-if="!beforeShowKokr"
            :data="kokrListForm.content"
            :columns="columns"
            :pagination.sync="paginationControl"
          >

            <q-tr slot="body" slot-scope="props" :props="props">
              <!--<q-td key="name" :props="props" width="25%">-->
                <!--{{ props.row.name }}-->
              <!--</q-td>-->
              <q-td key="kind" :props="props" width="15%">
                <div v-if="props.row.kind === '1'">工作目标</div>
                <div v-if="props.row.kind === '2'">额外目标</div>
              </q-td>
              <q-td key="title" :props="props" width="35%">
                {{ props.row.title }}
              </q-td>
              <q-td key="percent" :props="props" width="25%">
                {{ props.row.percent }}
              </q-td>
              <q-td key="op" :props="props" width="25%">
                <q-btn flat color="primary" icon="visibility" @click="renderKeyItemDetailDialog(props.row)">VIEW</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="edit" @click="openDialog4editKokrListForm(props.row)">EDIT</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="delete" @click="openDialog4delKokrListForm(props.row)">DELETE</q-btn>
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
        <div class="value-btns q-mb-md">
          <q-btn v-if="showSelfButton && vokrListForm.creator === vokrListForm.dealer && vokrListForm.status !== '20'" icon="add" label="新增" @click="checkAddVokr" class="q-mr-sm" />
          <q-btn v-if="showSelfButton && vokrListForm.creator === vokrListForm.dealer && vokrListForm.status !== '20'" icon="done" label="保存" :loading="loadingOkr" @click="addVokr" class="q-mr-sm" />
          <q-btn v-if="isShowPushButton && showSelfButton && vokrListForm.creator === vokrListForm.dealer && vokrListForm.status !== '20'" icon="trending_flat" label="提交" @click="dialogPostParentVokr(user.parent_id, user.role, null)" class="q-mr-sm" />
          <q-btn v-if="user._id === vokrListForm.dealer && vokrListForm.creator !== user._id && vokrListForm.status !== '20'" icon="done" label="通过" :loading="loadingOkr" @click="yesVokr" class="q-mr-sm" />
          <q-btn v-if="user._id === vokrListForm.dealer && vokrListForm.creator !== user._id && vokrListForm.status !== '20'" icon="clear" label="驳回" :loading="loadingOkr" @click="noVokr" class="q-mr-sm" />
        </div>
        <div v-if="vokrListForm.status !== '20'">当前处理人: <span style="color: crimson; font-size: 16px; font-weight: 700;">{{ valueParent.name }}</span></div>
        <div v-if="vokrListForm.status === '20'">已完结</div>
        <br>
        <div class="q-mb-md">总分: <span class="q-mr-md text-red-10">{{ vokrListForm.total_score }}</span> 评价等级: <span class="text-red-10">{{ vokrListForm.grade }}</span></div>
        <q-list bordered class="rounded-borders">
          <q-skeleton v-if="beforeShowVokr" height="350px" />
          <q-table
            v-if="!beforeShowVokr"
            :data="vokrListForm.content"
            :columns="columnsValue"
            :pagination.sync="paginationControl"
          >
            <q-tr slot="body" slot-scope="props" :props="props">
              <!--<q-td key="name" :props="props" width="25%">-->
              <!--{{ props.row.name }}-->
              <!--</q-td>-->
              <q-td key="kind" :props="props" width="15%">
                <div v-if="props.row.kind === '1'">工作目标</div>
                <div v-if="props.row.kind === '2'">额外目标</div>
              </q-td>
              <q-td key="title" :props="props" width="35%">
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
                <q-btn v-if="selectName === user.name && isShowPushButton" flat color="primary" icon="edit" @click="openDialog4editVokrListForm(props.row)">EDIT</q-btn>
                <q-btn v-if="selectName === user.name" flat color="primary" icon="delete" @click="openDialog4delVokrListForm(props.row)">DELETE</q-btn>
              </q-td>
            </q-tr>
          </q-table>
        </q-list>
        <q-input type="textarea" v-model="vokrListForm.comment_self" :readonly="vokrListForm.creator !== vokrListForm.dealer" icon="add" label="自我评价" class="q-mr-sm" />
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogValueItem" persistent transition-show="scale" transition-hide="scale">
    <q-card class="" style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ isEdit4ValueItem ? '编辑' : '新增' }}Value</div>
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
          <q-slider v-model="vokrForm.percent" :min="0" :max="vokrForm.kind === '1' ? 100 : 5"
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
  <q-dialog v-model="dialogValueItemDetail" persistent transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">『 {{ dialogValueItemDetailTask }} 』的任务描述</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <p v-for="(itemP, index) in dialogValueItemDetailDesc.split('\n')" v-bind:key="index" class="show-energy-desc-p" style="min-width: 300px;margin-top: 10px;">
          {{ itemP }}
        </p>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogValueItemPostParent" persistent transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">『 {{ selectName }} 』{{ selectYear }}年{{ selectMonth }}月 VALUE 提交至 『 {{ valueParent.name }} 』</div>
        <q-space />
        <q-btn icon="close" flat round dense />
      </q-card-section>

      <q-card-section>
        <p>提交后不可更改,确定吗?</p>
        <q-btn icon="trending_flat" label="提交" :loading="loadingOkr" @click="postParentVokr" />
      </q-card-section>
    </q-card>
  </q-dialog>
</div>
</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { date } from 'quasar'
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
      tellDateEdit: true,
      tellCurrentMonthShowKey: true,
      tellNextMonthShowValue: true,
      splitterModel: 50,
      user: undefined,
      loadingOkr: false,
      beforeShowUserList: true,
      beforeShowKokr: true,
      beforeShowVokr: true,
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
      dialogValueItemPostParent: false,
      isEdit4ValueItem: false,
      isShowPushButton: false,
      valueParent: {
        id: '',
        name: ''
      },
      teamLeader: {},
      showSelfButton: false,
      selectName: '',
      selectYear: '',
      selectMonth: '',
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
        total_score: 0,
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
      paginationControl: { rowsPerPage: 0, page: 1, sortBy: 'desc' },
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
      optionsYear: [],
      optionsMonth: []
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
    this.renderYearAndMonth()
    this.init()
  },
  watch: {
    selectYear: function () {
      this.getUserList('all')
      this.tellDateEditF()
    },
    selectMonth: function () {
      this.getUserList('all')
      this.tellDateEditF()
    },
    vokrListForm: {
      handler (oldVal, newVal) {
        this.countScoreAndGrade()
      },
      deep: true
    }
  },
  methods: {
    init () {
      const _this = this
      _this.user = JSON.parse(localStorage.getItem('user'))
      _this.getUserList('all')
    },
    renderYearAndMonth () {
      let year = date.formatDate(Date.now(), 'YYYY')
      let month = date.formatDate(Date.now(), 'M')
      const _this = this

      for (let i = 2020; i <= parseInt(year); i++) {
        _this.optionsYear.push(i + '')
      }
      for (let j = 1; j <= parseInt(month) + 1; j++) {
        _this.optionsMonth.push(j + '')
      }
      _this.selectYear = year
      _this.selectMonth = month
    },
    tellDateEditF () {
      const _this = this
      let year = date.formatDate(Date.now(), 'YYYY')
      let month = date.formatDate(Date.now(), 'M')

      if (year !== _this.selectYear || (month !== _this.selectMonth && parseInt(month) + 1 !== parseInt(_this.selectMonth))) {
        _this.tellDateEdit = false
      } else {
        _this.tellDateEdit = true
      }
      _this.tellCurrentMonthShowKey = month !== _this.selectMonth
      _this.tellNextMonthShowValue = parseInt(month) + 1 !== parseInt(_this.selectMonth)
    },
    getUserList (id) {
      const _this = this
      _this.$axios.post('/weeklyreportapi/getUserList', {
        type: 'okr',
        team: _this.user.team,
        year: _this.selectYear,
        month: _this.selectMonth,
        dealer: id
      }).then((res) => {
        if (res.data.code === 0) {
          if (res.data.data.length > 0) {
            // _this.tableData = _this.rendertableData(res.data.data);
            setTimeout(() => {
              _this.userList = res.data.data
              _this.beforeShowUserList = false
            }, 1500)
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
      const _this = this
      // TODO 新增kokr的时候,需要判断选择的selectYear和selectMonth是否处于当前的时间段
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
        } else {
          _this.kokrListForm.creator = _this.user._id
          _this.kokrListForm.team = _this.user.team
          _this.kokrListForm.content = []
          _this.$q.notify({
            message: '暂无数据',
            color: 'positive',
            position: 'top'
          })
        }
        _this.dialogKeyList = true
        setTimeout(() => {
          _this.beforeShowKokr = false
        }, 500)
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
      this.getUserList('all')
    },
    checkAddVokr () {
      const _this = this
      if (_this.countPercent().percent <= 0 || _this.countPercent().percentExtra <= 0) {
        _this.$q.notify({
          message: `工作目标权重不能超过100,还剩${_this.countPercent().percent},额外目标不能超过5,还剩${_this.countPercent().percentExtra}`,
          color: 'negative',
          position: 'top'
        })
        return
      }
      _this.dialogValueItem = true
    },
    saveValueOkr () {
      const _this = this
      let formContent = _this.vokrListForm.content
      if (_this.isEdit4ValueItem) {
        formContent.forEach(e => {
          if (e._id === _this.vokrForm._id) {
            // if (formContent.indexOf(e) > -1) {
            // let i = formContent.indexOf(e)
            // formContent.splice(i, 1)
            // }
            if ((_this.vokrForm.kind === '1' ? _this.countPercent().percent : _this.countPercent().percentExtra) < 0) {
              _this.$q.notify({
                message: `工作目标权重不能超过100,还剩${_this.countPercent().percent},额外目标不能超过5,还剩${_this.countPercent().percentExtra}`,
                color: 'negative',
                position: 'top'
              })
              return
            } else {
              e = _this.vokrForm
              // formContent.push(_this.vokrForm)
              _this.isEdit4ValueItem = false
            }
            _this.dialogValueItem = false
            _this.isShowPushButton = false
            _this.resetVokrForm()
          }
        })
      } else {
        if ((_this.vokrForm.kind === '1' ? _this.countPercent().percent : _this.countPercent().percentExtra) < 0) {
          _this.$q.notify({
            message: `工作目标权重不能超过100,还剩${_this.countPercent().percent},额外目标不能超过5,还剩${_this.countPercent().percentExtra}`,
            color: 'negative',
            position: 'top'
          })
          return
        }
        formContent.push(_this.vokrForm)
        _this.dialogValueItem = false
        _this.isShowPushButton = false
        _this.resetVokrForm()
      }
    },
    addVokr () {
      // TODO 新增vokr的时候,需要判断选择的selectYear和selectMonth是否处于当前的时间段
      const _this = this
      if (_this.countPercent().res) {
        _this.$q.notify({
          message: `工作目标权重不能超过100,还剩${_this.countPercent().percent},额外目标不能超过5,还剩${_this.countPercent().percentExtra}`,
          color: 'negative',
          position: 'top'
        })
        return
      }
      _this.vokrListForm.year = _this.selectYear
      _this.vokrListForm.month = _this.selectMonth
      _this.vokrListForm.team = _this.user.team
      _this.vokrListForm.last_person = _this.user._id
      _this.vokrListForm.status = _this.user.role === 1 ? '12' : '1'
      // _this.countScoreAndGrade()
      _this.loadingOkr = true

      if (!_this.vokrListForm.content || _this.vokrListForm.content.length === 0 || _this.vokrListForm.content === null) {
        _this.$q.notify({
          message: '东西都没有,你提交啥?',
          color: 'negative',
          position: 'top'
        })
        _this.loadingOkr = false
        return
      }

      _this.$axios.post('/weeklyreportapi/vokr/add', _this.vokrListForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingOkr = false
          _this.dialogValueItem = false
          _this.isShowPushButton = true
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
          // TODO 根据此record的状态码,来确定当前处理人
          _this.getUserInfoById(_this.vokrListForm.dealer)
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
          _this.$q.notify({
            message: '暂无数据',
            color: 'positive',
            position: 'top'
          })
        }
        _this.dialogValueList = true
        setTimeout(() => {
          _this.beforeShowVokr = false
        }, 500)
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
      _this.isShowPushButton = false
      let formContent = _this.vokrListForm.content
      formContent.forEach(e => {
        if (e._id === data._id) {
          if (formContent.indexOf(e) > -1) {
            let i = formContent.indexOf(e)
            formContent.splice(i, 1)
          }
        }
      })
      if (_this.vokrListForm.content === null) {
        _this.vokrListForm.content = []
      }
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
    dialogPostParentVokr (userId, role, isSingle) {
      const _this = this
      if (!isSingle) _this.dialogValueItemPostParent = true
      if (_this.user.role === 1) {
        _this.$axios.post('/weeklyreportapi/team/getLeaderInfoByTeam', {
          id: _this.vokrListForm.team
        }).then((res) => {
          if (res.data.data) {
            _this.valueParent = {
              id: res.data.data._id,
              name: res.data.data.name
            }
          } else {
            _this.valueParent = {
              id: '',
              name: ''
            }
          }
        }).catch((error) => {
          _this.handleError(error)
        })
      } else {
        _this.getUserInfoById(userId)
      }
    },
    getUserInfoById (id) {
      const _this = this
      _this.$axios.post('/weeklyreportapi/user/getUserInfo', {
        id: id
      }).then((res) => {
        if (res.data.code === 0) {
          if (res.data.data) {
            _this.valueParent = {
              id: res.data.data._id,
              name: res.data.data.name
            }
          } else {
            _this.valueParent = {
              id: '',
              name: ''
            }
          }
        }
      }).catch((error) => {
        _this.handleError(error)
      })
      _this.$axios.post('/weeklyreportapi/team/getLeaderInfoByTeam', {
        id: _this.vokrListForm.team
      }).then((res) => {
        if (res.data.data) {
          _this.teamLeader = res.data.data
        } else {
          _this.teamLeader = {}
        }
      }).catch((error) => {
        _this.handleError(error)
      })
    },
    postParentVokr () {
      const _this = this
      _this.vokrListForm.year = _this.selectYear
      _this.vokrListForm.month = _this.selectMonth
      _this.vokrListForm.team = _this.user.team
      _this.vokrListForm.dealer = _this.valueParent.id
      _this.vokrListForm.last_person = _this.user._id
      _this.vokrListForm.status = _this.user.role === 1 ? '13' : '2'
      _this.loadingOkr = true
      _this.$axios.post('/weeklyreportapi/vokr/add', _this.vokrListForm).then((res) => {
        if (res.data.code === 0) {
          _this.loadingOkr = false
          _this.dialogValueItem = false
          _this.dialogValueItemPostParent = true
          _this.$q.notify({
            message: res.data.message,
            color: 'positive',
            position: 'top'
          })
          _this.getValueItemData({ id: _this.user._id, team: _this.user.team, name: _this.user.name })
          _this.dialogValueItemPostParent = false
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    yesVokr () {
      // TODO 如果是小组长, 通过的话是10, 如果是TL通过,是20
      const _this = this
      if (_this.user.role === 1) {
        _this.vokrListForm.status = '10'
        _this.vokrListForm.dealer = _this.teamLeader._id
      } else if (_this.user.role === 0) {
        _this.vokrListForm.status = '20'
      }
      _this.vokrListForm.last_person = _this.user._id
      _this.loadingOkr = true

      if (!_this.vokrListForm.content || _this.vokrListForm.content.length === 0 || _this.vokrListForm.content === null) {
        _this.$q.notify({
          message: '东西都没有,你提交啥?',
          color: 'negative',
          position: 'top'
        })
        _this.loadingOkr = false
        return
      }

      _this.$axios.post('/weeklyreportapi/vokr/add', _this.vokrListForm).then((res) => {
        if (res.data.code === 0) {
          _this.getUserInfoById(_this.teamLeader._id)
          _this.loadingOkr = false
          _this.dialogValueItem = false
          _this.$q.notify({
            message: `通过,已提交给『 ${_this.teamLeader.name}』`,
            color: 'positive',
            position: 'top'
          })
        } else {}
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    noVokr () {
      // TODO 如果是小组长, 驳回的话是11, 如果是TL驳回,是21
      const _this = this
      if (_this.user.role === 1) {
        _this.vokrListForm.status = '11'
      } else if (_this.user.role === 0) {
        _this.vokrListForm.status = '21'
      }
      _this.vokrListForm.dealer = _this.vokrListForm.creator
      _this.vokrListForm.last_person = _this.user._id
      _this.loadingOkr = true

      if (!_this.vokrListForm.content || _this.vokrListForm.content.length === 0 || _this.vokrListForm.content === null) {
        _this.$q.notify({
          message: '东西都没有,你提交啥?',
          color: 'negative',
          position: 'top'
        })
        _this.loadingOkr = false
        return
      }

      _this.$axios.post('/weeklyreportapi/vokr/add', _this.vokrListForm).then((res) => {
        if (res.data.code === 0) {
          _this.getUserInfoById(_this.vokrListForm.creator)
          _this.loadingOkr = false
          _this.dialogValueItem = false
          _this.$q.notify({
            message: `驳回,已转给『 ${_this.selectName}』`,
            color: 'positive',
            position: 'top'
          })
        } else {

        }
      }).catch((error) => {
        console.log(error)
        _this.loadingOkr = false
      })
    },
    countPercent () {
      const _this = this
      let contentPercent = 0
      let contentPercentExtra = 0
      for (let i = 0, size = _this.vokrListForm.content.length; i < size; i++) {
        let item = _this.vokrListForm.content[i]
        if (item['kind'] === '1') {
          contentPercent += parseInt(item['percent'])
        } else if (item['kind'] === '2') {
          contentPercentExtra += parseInt(item['percent'])
        }
      }
      return { res: (contentPercent > 100 || contentPercentExtra > 5), percent: 100 - contentPercent, percentExtra: 5 - contentPercentExtra }
    },
    countScoreAndGrade () {
      // 算个人评分 gscore total_score grade
      const _this = this
      let contentScore = 0
      let contentScoreExtra = 0
      if (_this.vokrListForm.content.length <= 0) {
        _this.vokrListForm.total_score = 0
        _this.vokrListForm.grade = 'E'
        return
      }
      for (let i = 0, size = _this.vokrListForm.content.length; i < size; i++) {
        let item = _this.vokrListForm.content[i]
        if (item['kind'] === '1') {
          contentScore += (parseInt(item['score']) * (parseInt(item['percent']) / 100))
        } else if (item['kind'] === '2') {
          contentScoreExtra += (parseInt(item['score']) * (parseInt(item['percent']) / 100))
        }
      }
      _this.vokrListForm.total_score = (0.7 * (contentScore + contentScoreExtra) + 0.3 * parseInt(_this.vokrListForm.gscore)).toFixed(2)

      let tScore = parseFloat(_this.vokrListForm.total_score)

      if (tScore >= 95) {
        _this.vokrListForm.grade = 'A'
      } else if (tScore > 90 && tScore < 95) {
        _this.vokrListForm.grade = 'B'
      } else if (tScore >= 80 && tScore <= 90) {
        _this.vokrListForm.grade = 'C'
      } else if (tScore >= 70 && tScore < 80) {
        _this.vokrListForm.grade = 'D'
      } else if (tScore < 70) {
        _this.vokrListForm.grade = 'E'
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
}
</style>
