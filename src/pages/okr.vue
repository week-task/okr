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
            <span v-if="!item.kokrData.content && tellDateEdit && tellCurrentMonthShowKey" style="color: #fff; background: rgb(219, 40, 40); margin: 0 10px; padding: 3px 10px;">目标为空</span>
            <span v-if="!item.vokrData.content && tellDateEdit && tellNextMonthShowValue" style="color: #fff; background: rgb(219, 40, 40); margin: 0 10px; padding: 3px 10px;">成果为空</span>
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
            <div class="text-h5 q-mb-md">{{ selectYear }}年{{ selectMonth }}月 工作目标(O)</div>
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
            <div class="text-h5 q-mb-md">{{ selectYear }}年{{ selectMonth }}月 绩效成果(KR)</div>
            <q-btn v-if="!item.vokrData.content && item.name === user.name && tellDateEdit && tellNextMonthShowValue" icon="add" class="full-width" @click="getValueItemData(item)" />
            <q-btn v-if="item.vokrData.content && (item.name === user.name || item.vokrData.dealer === user._id) && tellDateEdit && tellNextMonthShowValue" icon="edit" class="full-width" @click="getValueItemData(item)" />
            <q-btn v-if="item.vokrData.content && (item.name !== user.name && item.vokrData.dealer !== user._id) && tellDateEdit && tellNextMonthShowValue" icon="trending_flat" class="full-width" @click="getValueItemData(item)" />
            <div v-for="(itemP, index) in item.vokrData.content" :key="index" class="q-my-md show-kv-p">
              <span style="font-size: 16px; font-weight: 700;">● {{ itemP.title }}({{ itemP.score }}分)</span>
              <br>
              <p v-for="(itemPp, index) in itemP.desc.split('\n')" v-bind:key="index" class="show-energy-desc-p">
                <span style="font-size: 14px; font-weight: 300;">○ {{ itemPp }}</span>
              </p>
            </div>
            <div style="margin-bottom: 10px;"><span style="font-weight: bold;">自我评价:</span><br>{{ item.vokrData.comment_self || '暂无' }}</div>
            <div style="margin-bottom: 10px;"><span style="font-weight: bold;">组长评价:</span><br>{{ item.vokrData.comment || '暂无' }}</div>
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
        <div class="text-h6">『 {{ selectName }} 』{{ selectYear }}年{{ selectMonth }}月 工作目标(O)</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div>
          <q-btn v-if="showSelfButton" icon="add" label="新增" @click="checkAddKokr" style="margin-right: 10px;" />
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
        <div class="text-h6">{{ isEdit4KeyItem ? '编辑' : '新增' }} 工作目标(O)</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="saveKeyOkr">
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
            <q-slider v-model="kokrForm.percent" :min="0" :max="kokrForm.kind === '1' ? 100 : 5"
                      :step="kokrForm.kind === '1' ? 5 : 1"
                      label
                      label-always/>
          </q-field>
          <q-field
            borderless
            class="form-field">
            <q-input label="目标内容"
                     type="text"
                     class="full-width"
                     v-model="kokrForm.title"
                     lazy-rules
                     :rules="[ val => val && val.length > 4 || '长度不得小于5']" />
          </q-field>
          <q-field
            class="form-field"
            borderless>
            <q-input label="目标详解"
                     type="textarea"
                     class="full-width"
                     v-model="kokrForm.desc"
                     lazy-rules
                     :rules="[ val => val && (val.length > 4 && val.length <= 200) || '长度在5-200']" />
          </q-field>

          <div class="group-button">
            <q-btn
              type="submit"
              :loading="loadingOkr"
              color="primary">
              暂存
              <q-spinner-hourglass slot="loading" size="20px" />
              <span slot="loading">Loading...</span>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogKeyItemDetail" persistent transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">『 {{ dialogKeyItemDetailTask }} 』的目标详解</div>
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
        <div class="text-h6">『 {{ selectName }} 』{{ selectYear }}年{{ selectMonth }}月 绩效成果(KR)</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="value-btns q-mb-md" v-if="vokrListForm.status !== '20'">
          <q-btn v-if="showSelfButton && vokrListForm.creator === vokrListForm.dealer" icon="add" label="新增" @click="checkAddVokr" class="q-mr-sm" />
          <q-btn v-if="showSelfButton && vokrListForm.creator === vokrListForm.dealer && isShowCopyButton" icon="toll" label="复制" @click="copyVokr" class="q-mr-sm" />
          <q-btn v-if="showSelfButton && vokrListForm.creator === vokrListForm.dealer" icon="done" label="保存" :loading="loadingOkr" @click="addVokr" class="q-mr-sm" />
          <q-btn v-if="isShowPushButton && showSelfButton && vokrListForm.creator === vokrListForm.dealer" icon="trending_flat" label="提交" @click="dialogPostParentVokr(user.parent_id, user.role, null)" class="q-mr-sm" />
          <q-btn v-if="user._id === vokrListForm.dealer && vokrListForm.creator !== user._id" icon="done" label="通过" :loading="loadingOkr" @click="yesVokr" class="q-mr-sm" />
          <q-btn v-if="user._id === vokrListForm.dealer && vokrListForm.creator !== user._id" icon="clear" label="驳回" :loading="loadingOkr" @click="noVokr" class="q-mr-sm" />
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
                <q-btn v-if="selectName === user.name && vokrListForm.creator === vokrListForm.dealer" flat color="primary" icon="edit" @click="openDialog4editVokrListForm(props.row)">EDIT</q-btn>
                <q-btn v-if="selectName === user.name && vokrListForm.creator === vokrListForm.dealer" flat color="primary" icon="delete" @click="openDialog4delVokrListForm(props.row)">DELETE</q-btn>
              </q-td>
            </q-tr>
          </q-table>
        </q-list>
        <q-input type="textarea" v-model="vokrListForm.comment_self" :readonly="vokrListForm.creator !== vokrListForm.dealer" icon="add" label="自我评价" class="q-mr-sm" />
        <q-input type="textarea" v-model="vokrListForm.comment" :readonly="user.role === 2 || vokrListForm.creator === user._id" icon="add" label="组长评价" class="q-mr-sm" />
        <q-field
          :readonly="user.role !== 0"
          borderless
          label="TL评分,占比30%"
          class="form-field">
          <q-slider v-model="vokrListForm.gscore" :min="30" :max="100"
                    :readonly="user.role !== 0"
                    label
                    label-always/>
        </q-field>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogValueItem" persistent transition-show="scale" transition-hide="scale">
    <q-card class="" style="width: 600px">
      <q-card-section>
        <div class="text-h6">{{ isEdit4ValueItem ? '编辑' : '新增' }} 绩效成果(KR)</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="saveValueOkr">
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
                      :step="vokrForm.kind === '1' ? 5 : 1"
                      label
                      label-always/>
          </q-field>
          <q-field
            borderless
            class="form-field">
            <q-input label="目标内容"
                     type="text"
                     class="full-width"
                     v-model="vokrForm.title"
                     lazy-rules
                     :rules="[ val => val && val.length > 4 || '长度不得小于5']" />
          </q-field>
          <q-field
            class="form-field"
            borderless>
            <q-input label="目标详解"
                     type="textarea"
                     class="full-width"
                     v-model="vokrForm.desc"
                     lazy-rules
                     :rules="[ val => val && (val.length > 4 && val.length <= 200) || '长度在5-200']" />
          </q-field>
          <q-field
            borderless
            label="分数"
            class="form-field">
              <q-slider v-model="vokrForm.score" :min="70" :max="100"
                      label
                      label-always/>
          </q-field>

          <div class="group-button">
            <q-btn
              type="submit"
              :loading="loadingOkr"
              color="primary">
              暂存
              <q-spinner-hourglass slot="loading" size="20px" />
              <span slot="loading">Loading...</span>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogValueItemDetail" persistent transition-show="scale" transition-hide="scale">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">『 {{ dialogValueItemDetailTask }} 』的目标详解</div>
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
        <div class="text-h6">『 {{ selectName }} 』{{ selectYear }}年{{ selectMonth }}月 工作成果提交至『 {{ valueParent.name }} 』</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup @click="resetValueParent" />
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
        label: 'HOME', toLink: 'https://luolinjia.com/tt/#/console'
      }, {
        label: 'OKR', toLink: '/okr'
      }],
      funName: '月报OKR',
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
      isShowCopyButton: false,
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
        time: '',
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
        time: '',
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
        label: '目标内容',
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
        label: '目标内容',
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
      // changelog: 根据涛哥这边的要求,我们的绩效每个月不再固定,所以时间上,OKR系统要根据适度的进行调配
      const _this = this
      let year = date.formatDate(Date.now(), 'YYYY')
      let month = date.formatDate(Date.now(), 'M')
      let day = date.formatDate(Date.now(), 'D')

      // if (year !== _this.selectYear || (month !== _this.selectMonth && parseInt(month) + 1 !== parseInt(_this.selectMonth)) || parseInt(day) < 20) {
      //  _this.tellDateEdit = false
      // } else {
      //  _this.tellDateEdit = true
      // }

      // 2020-05-30: 更新为本月可以评价上个月的绩效
      if (year !== _this.selectYear || !(month === _this.selectMonth || parseInt(month) - 1 === parseInt(_this.selectMonth)) || parseInt(month) + 1 === parseInt(_this.selectMonth) || (parseInt(day) < 20 && parseInt(day) > 10)) {
        _this.tellDateEdit = false
      } else {
        _this.tellDateEdit = true
      }

      _this.tellCurrentMonthShowKey = parseInt(month) + 1 === parseInt(_this.selectMonth)
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
            }, 500)
          } else if (res.data.data.length === 0) {
            _this.userList = []
          }
        }
      }).catch((error) => {
        _this.handleError(error)
      })
    },
    checkAddKokr () {
      const _this = this
      if (_this.countPercent('key').percent <= 0 && _this.countPercent('key').percentExtra <= 0) {
        _this.$q.notify({
          message: `工作目标权重不能超过100,还剩${_this.countPercent('key').percent},额外目标不能超过5,还剩${_this.countPercent('key').percentExtra}`,
          color: 'negative',
          position: 'top'
        })
        return
      }
      _this.kokrForm.time = Date.now() + ''
      _this.dialogKeyItem = true
    },
    saveKeyOkr () {
      const _this = this
      if (_this.kokrForm.kind === '2') _this.kokrForm.percent = 5
      let formContent = _this.kokrListForm.content
      let flag = (_this.kokrForm.kind === '1' ? _this.countPercent('key').percent - _this.kokrForm.percent : _this.countPercent('key').percentExtra - _this.kokrForm.percent) < 0
      if (_this.isEdit4KeyItem) {
        formContent.forEach(e => {
          if (e.time === _this.kokrForm.time) {
            e.percent = _this.kokrForm.percent
            if ((_this.kokrForm.kind === '1' ? _this.countPercent('key').percent : _this.countPercent('key').percentExtra) < 0) {
              _this.$q.notify({
                message: `工作目标权重不能超过100,还剩${_this.countPercent('key').percent},额外目标不能超过5,还剩${_this.countPercent('key').percentExtra}`,
                color: 'negative',
                position: 'top'
              })
              return
            } else {
              e = _this.kokrForm
              // formContent.push(_this.vokrForm)
              _this.isEdit4KeyItem = false
            }
            _this.dialogKeyItem = false
            _this.resetKokrForm()
          }
        })
      } else {
        if (flag) {
          _this.$q.notify({
            message: `工作目标权重不能超过100,还剩${_this.countPercent('key').percent},额外目标不能超过5,还剩${_this.countPercent('key').percentExtra}`,
            color: 'negative',
            position: 'top'
          })
          return
        }
        formContent.push(_this.kokrForm)
        _this.dialogKeyItem = false
        _this.resetKokrForm()
      }
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
        if (e.time === data.time) {
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
      if (_this.countPercent('value').percent <= 0 && _this.countPercent('value').percentExtra <= 0) {
        _this.$q.notify({
          message: `工作目标权重不能超过100,还剩${_this.countPercent('value').percent},额外目标不能超过5,还剩${_this.countPercent('value').percentExtra}`,
          color: 'negative',
          position: 'top'
        })
        return
      }
      _this.vokrForm.time = Date.now() + ''
      _this.dialogValueItem = true
    },
    copyVokr () {
      const _this = this
      if (_this.countPercent('value').percent <= 0 && _this.countPercent('value').percentExtra <= 0) {
        _this.$q.notify({
          message: `工作目标权重不能超过100,还剩${_this.countPercent('value').percent},额外目标不能超过5,还剩${_this.countPercent('value').percentExtra}`,
          color: 'negative',
          position: 'top'
        })
        return
      }

      _this.$q.dialog({
        title: '确认复制?',
        message: `复制${_this.selectYear}年${_this.selectMonth}月目标到${_this.selectYear}年${_this.selectMonth}月绩效?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        let params = {
          creator: _this.user._id,
          year: _this.selectYear,
          month: _this.selectMonth,
          team: _this.user.team
        }

        _this.$axios.post('/weeklyreportapi/vokr/copy', params).then((res) => {
          if (res.data.code === 0) {
            _this.$q.notify({
              message: res.data.message,
              color: 'positive',
              position: 'top'
            })
            _this.isShowCopyButton = false
            _this.getValueItemData({ id: _this.user._id, team: _this.user.team, name: _this.user.name })
          } else {

          }
        }).catch((error) => {
          console.log(error)
        })
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        console.log('I am triggered on both OK and Cancel')
      })
    },
    saveValueOkr () {
      const _this = this
      // if (_this.vokrForm.kind === '2') _this.vokrForm.percent = 5
      let formContent = _this.vokrListForm.content
      let flag = (_this.vokrForm.kind === '1' ? _this.countPercent('value').percent - _this.vokrForm.percent : _this.countPercent('value').percentExtra - _this.vokrForm.percent) < 0
      if (_this.isEdit4ValueItem) {
        formContent.forEach(e => {
          if (e.time === _this.vokrForm.time) {
            e.percent = _this.vokrForm.percent
            if ((_this.vokrForm.kind === '1' ? _this.countPercent('value').percent : _this.countPercent('value').percentExtra) < 0) {
              _this.$q.notify({
                message: `工作目标权重不能超过100,还剩${_this.countPercent('value').percent},额外目标不能超过5,还剩${_this.countPercent('value').percentExtra}`,
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
        if (flag) {
          _this.$q.notify({
            message: `工作目标权重不能超过100,还剩${_this.countPercent('value').percent},额外目标不能超过5,还剩${_this.countPercent('value').percentExtra}`,
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
      if (_this.countPercent('value').res) {
        _this.$q.notify({
          message: `工作目标权重不能超过100,还剩${_this.countPercent('value').percent},额外目标不能超过5,还剩${_this.countPercent('value').percentExtra}`,
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
          _this.isShowCopyButton = true
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
        if (e.time === data.time) {
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

      if (!_this.vokrListForm.comment_self) {
        // _this.dialogValueItemPostParent = false
        _this.$q.notify({
          message: '自我评价别忘写',
          color: 'negative',
          position: 'top'
        })
        return
      }

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
      _this.vokrListForm.gscore = 100
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
    countPercent (flag) {
      const _this = this
      let contentPercent = 0
      let contentPercentExtra = 0
      let arrs = (flag === 'key') ? _this.kokrListForm : _this.vokrListForm
      for (let i = 0, size = arrs.content.length; i < size; i++) {
        let item = arrs.content[i]
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
        _this.vokrListForm.grade = 'C'
        return
      }
      for (let i = 0, size = _this.vokrListForm.content.length; i < size; i++) {
        let item = _this.vokrListForm.content[i]
        if (item['score'] === undefined) {
          _this.vokrListForm.total_score = 0
          _this.vokrListForm.grade = 'C'
          return
        }
        if (item['kind'] === '1') {
          contentScore += (parseInt(item['score']) * (parseInt(item['percent']) / 100))
        } else if (item['kind'] === '2') {
          contentScoreExtra += (parseInt(item['score']) * (parseInt(item['percent']) / 100))
        }
      }
      _this.vokrListForm.total_score = (0.7 * (contentScore + contentScoreExtra) + 0.3 * parseInt(_this.vokrListForm.gscore)).toFixed(2)

      let tScore = parseFloat(_this.vokrListForm.total_score)

      if (tScore > 95) {
        _this.vokrListForm.grade = 'S'
      } else if (tScore > 90 && tScore <= 95) {
        _this.vokrListForm.grade = 'A'
      } else if (tScore >= 80 && tScore <= 90) {
        _this.vokrListForm.grade = 'B'
      } else if (tScore >= 70 && tScore < 80) {
        _this.vokrListForm.grade = 'B-'
      } else if (tScore < 70) {
        _this.vokrListForm.grade = 'C'
      }
    },
    resetValueParent () {
      const _this = this
      _this.valueParent = {
        id: _this.user._id,
        name: _this.user.name
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
