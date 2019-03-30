import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { pickHTMLProps } from 'pick-react-known-prop';
import { IProps, propsToOptions } from './ConfigUtils';
import { isSameArray } from './Utils';

/* tslint:disable-next-line */
const Tabulator = require('tabulator-tables');

interface IState {
  data: any[];
}

export default class extends React.Component<IProps, Partial<IState>> {
  state: IState = {
    data: []
  };

  ref: any = null;
  htmlProps: any = null;
  mainId = `tabulator-${+new Date()}-${Math.floor(Math.random() * 9999999)}`; // random id
  table: any = null; // will be set once Tabulator instantiated

  componentDidMount() {
    const domEle: any = ReactDOM.findDOMNode(this.ref); // mounted DOM element
    const that = this;
    const { columns, data, options } = this.props;
    const propOptions = propsToOptions(this.props);

    new Tabulator(domEle, {
      columns,
      ...propOptions,
      layout: 'fitColumns', // fit columns to width of table (optional)
      tableBuilding() {
        that.table = this; // keep table instance
        that.props.tableBuilding ? that.props.tableBuilding() : '';
      },
      dataLoaded() {
        that.props.dataLoaded ? that.props.dataLoaded() : '';
      },
      ...options, // props.options are passed to Tabulator's options.
      data
    });
    // await table.setData(data);
    // console.log('- componentDidMount');
    if (data && data.length > 0) {
      this.setState({ data });
    }
  }

  componentWillUnmount() {
    this.table.destroy();
  }

  // React 16.5.x - "getDerivedStateFromProps" replaces both "componentWillMount" & "componentWillReceiveProps"
  // This function will be ignored when running with React 15.6.x
  static getDerivedStateFromProps(props: any, state: any): any {
    // console.log('- getDerivedStateFromProps', props, state);
    const noData = !props.data || props.data.length === 0;
    if (!state && noData) {
      // first time (similar to: componentWillMount)
      return null;
    }
    if (state && state.data && state.data.length === 0 && props.data.length === 0) {
      return null;
    }
    if (state && props.data) {
      // this triggers componentDidUpdate
      if (!isSameArray(state.data, props.data)) {
        return { ...state, data: props.data };
      }
    }
    return {};
  }

  // componentDidUpdate(prevProps, prevState)
  componentDidUpdate() {
    this.table.setData(this.state.data);
  }

  pickValidHTMLProps = () => {
    // run once
    if (!this.htmlProps) {
      this.htmlProps = pickHTMLProps(this.props); // pick valid html props
      delete this.htmlProps['data']; // don't render data & columns as attributes
      delete this.htmlProps['columns'];
    }
  };

  render() {
    this.pickValidHTMLProps();
    const { className } = this.props;
    return <div ref={ref => (this.ref = ref)} data-instance={this.mainId} {...this.htmlProps} className={className} />;
  }
}
