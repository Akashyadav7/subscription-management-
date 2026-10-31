import { Component } from 'react';
export default class ErrorBoundary extends Component {
  constructor(props){super(props);this.state={err:null};}
  static getDerivedStateFromError(err){return {err};}
  render(){ if(this.state.err) return <div style={{padding:20,color:'red'}}>{String(this.state.err)}</div>; return this.props.children; }
}
