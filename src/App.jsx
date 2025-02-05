import { useState, useEffect } from 'react'

// 要先裝 chrome react dev tools 插件 才能用
const findMyFiberNode = (root, targetComponentName) => {
  let node = root;
  while (node) {
    if (node.type && node.type.name === targetComponentName) {
      return node;
    }
    if (node.child) {
      const found = findMyFiberNode(node.child, targetComponentName);
      if (found) return found;
    }
    node = node.sibling;
  }
  return null;
};

function useFindNode(targetComponentName) {
  useEffect(() => {
    const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (devTools) {
      const fiberRoots = devTools.getFiberRoots(devTools.renderers.keys().next().value);
      for (const root of fiberRoots) {
        const myFiber = findMyFiberNode(root.current, targetComponentName);
        if (myFiber) {
          console.log(`${targetComponentName} Fiber Node:`, myFiber);
        }
      }
    }
  });
}

function useData(initData) {
  const [data, setData] = useState(initData ?? 0)
  return [data, setData]
}


function Parent() {
  const [ data, setData ] = useData(0)

  return (
    <div>
      <h1>Parent</h1>
      <p>{data}</p>
      <button onClick={() => setData(data + 1)}>Increment</button>
      <Child value={data}/>
    </div>
  )
}

function Child() {
  const [ data, setData ] = useState(100)
  const [ text, setText ] = useState('')

  useFindNode('Child');

  return (
    <div>
      <h1>Child</h1>
      <p>{data}</p>
      <button onClick={() => setData(data + 1)}>Increment</button>
      <p>{text}</p>
      {/* input the text */}
      <input type="text" onChange={(e)=> setText(e.target.value)} />
      

    </div>
  )
}

export default Parent
