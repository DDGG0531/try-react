import { useState, useEffect, createContext, useContext, memo } from 'react'

// 修改 findMyFiberNode 函數
const findMyFiberNode = (root, targetComponentName, targetId) => {
  let node = root;
  while (node) {
    if (node.type && node.type.name === targetComponentName) {
      return node;
    }
    if (node.child) {
      const found = findMyFiberNode(node.child, targetComponentName, targetId);
      if (found) return found;
    }
    node = node.sibling;
  }
  return null;
};

// 修改 useFindNode 函數
function useFindNode(targetComponentName, targetId) {
  useEffect(() => {
    const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (devTools) {
      const fiberRoots = devTools.getFiberRoots(devTools.renderers.keys().next().value);
      for (const root of fiberRoots) {
        const myFiber = findMyFiberNode(root.current, targetComponentName, targetId);
        if (myFiber) {
          console.log(`${targetComponentName} Fiber Node (ID: ${targetId}):`, myFiber);
        }
      }
    }
  });
}

function useData(initData) {
  const [data, setData] = useState(initData ?? 0)
  return [data, setData]
}

// 建立 Context
// context的值放在 fiber node 的dependencies.firstContext

const MyContext = createContext({ contextData: null, setContextData: () => { } });

function Parent() {
  const [contextData, setContextData] = useState(0)
  const [data, setData] = useData(777)

  useFindNode('Parent');


  return (
    <>
      <div style={{ margin: '20px', padding: '20px', border: '1px solid #ccc' }}>
        <h1>Parent</h1>
        <p>Data: {data}</p>
        <button onClick={() => setData(data + 1)}>Increment</button>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <MyContext.Provider value={{ contextData, setContextData }}>
            <Child value={data} id={1} />
            <MyContext.Provider value={{ contextData: data, setContextData: setData }}>
              <Child value={data} id={2} />
            </MyContext.Provider>
          </MyContext.Provider>
          <Child value={data} id={3} />
        </div>
      </div>
    </>
  )
}

function _Child(props) {
  const [data, setData] = useState(100)
  const [text, setText] = useState('')

  const { id } = props;

  const { contextData: parentData, setContextData: setParentData } = useContext(MyContext);

  useFindNode('_Child', id);

  return (
    <div style={{ margin: '20px', padding: '20px', border: '1px solid #eee' }}>
      <h1>Child id:{id}</h1>
      {/* 顯示 Context 中的資料 */}
      <p>Parent Data: {parentData}</p>
      <button onClick={() => setParentData(parentData + 1)}>Increment Parent Data</button>
      <p>Child Data: {data}</p>
      <button onClick={() => setData(data + 1)}>Increment</button>
      <p>Text: {text}</p>
      {/* input the text */}
      <input type="text" onChange={(e) => setText(e.target.value)} />
    </div>
  )
}



const Child = memo(_Child, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});

export default Parent
