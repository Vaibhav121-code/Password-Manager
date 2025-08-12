import React, { useEffect } from 'react'
import { useRef, useState } from 'react'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

const Manager = () => {
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [passwordArray, setPasswordArray] = useState([])
    const getpasswords=async()=>{
        let req=await fetch("http://localhost:3000/")
        let passwords = await req.json();
        setPasswordArray(passwords);
        console.log(passwords);
    }
    useEffect(() => {
        getpasswords()
    }, [])
    const copytext = (text) => {
        toast('copied to clipboard', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });
        navigator.clipboard.writeText(text)
    }
    const showpassword = () => {
        passwordRef.current.type = "text"
        console.log(ref.current.src);
        if (ref.current.src.includes("icons/eyecross.png")) {
            ref.current.src = "icons/eye.png"
            passwordRef.current.type = "text"
        } else {
            ref.current.src = "icons/eyecross.png"
            passwordRef.current.type = "password"
        }

    }
    const savePassword = async() => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            await fetch("http://localhost:3000/",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:form.id})})
            setPasswordArray([...passwordArray, { ...form, id: uuidv4() }])
            await fetch("http://localhost:3000/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ ...form, id: uuidv4()})})
            //localStorage.setItem("passwords", JSON.stringify([...passwordArray, { ...form, id: uuidv4() }]))
            //console.log(...passwordArray, form)
            setform({ site: "", username: "", password: "" })
            toast('Password Saved', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        } else {
            toast('Password not saved', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });

        }


    }
    const deletePassword = async(id) => {
        console.log("Deleting password with id:", id)
        let c = confirm("Do you really want to delete password")
        if (c) {
            setPasswordArray(passwordArray.filter(item => item.id !== id))
            let res=await fetch("http://localhost:3000/",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({ id})})
            //localStorage.setItem("password", JSON.stringify([passwordArray.filter(item => item.id !== id)]))
            toast('Password Deleted', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }

        // console.log(...passwordArray, form)
    }
    const editPassword = (id) => {
        console.log("Editing password with id:", id)
        setform({...passwordArray.filter(i => i.id === id)[0],id:id})
        setPasswordArray(passwordArray.filter(item => item.id !== id))
        // localStorage.setItem("password", JSON.stringify([...passwordArray,{...form , id: uuidv4()}]))
        // console.log(...passwordArray, form)
    }
    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className=" absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
            <div className=' p-3 md:p-0 md:mycontainer min-h-[82vh]'>
                <h1 className=' text-4xl text font-bold text-center'>
                    <span className=' text-green-500'>&lt;</span>
                    Pass<span className=' text-green-500'>OP/&gt;</span>
                </h1>
                <p className=' text-green-700 text-lg'>Your own Password Manager</p>
                <div className=' flex flex-col p-4 text-black gap-8 items-center'>
                    <input value={form.site} onChange={handleChange} placeholder="Enter Site" className=' rounded-full bg-white border border-green-700 w-full p-4 py-1' type='text' name="site" id="site" />
                    <div className=' flex flex-col md:flex-row w-full justify-between gap-8'>
                        <input value={form.username} onChange={handleChange} placeholder="Enter Username" className=' rounded-full bg-white border border-green-700 w-full p-4 py-1' type='text' name="username" id="username" />
                        <div className=' relative'>
                            <input ref={passwordRef} value={form.password} onChange={handleChange} placeholder="Enter Password" className=' rounded-full bg-white border border-green-700 w-full p-4 py-1' type='password' name="password" id="password" />
                            <span className=' absolute right-[4px] top-[3px] cursor-pointer' onClick={showpassword}>
                                <img ref={ref} className=' p-1' width={26} src="icons/eye.png" alt="eye" />
                            </span>
                        </div>

                    </div>
                    <button onClick={savePassword} className=' flex justify-center items-center gap-2 bg-green-500 hover:bg-green-400 rounded-full px-5 py-2 w-fit border-2 border-green-900'>
                        <lord-icon
                            src="https://cdn.lordicon.com/efxgwrkc.json"
                            trigger="hover">
                        </lord-icon>
                        Save password</button>
                </div>
                <div className=' passwords'>
                    <h2 className='font-bold text-2xl py-4'>Your Passwords</h2>
                    {passwordArray.length === 0 && <div>No passwords to show</div>}
                    {passwordArray.length != 0 && <table className=" table table-auto w-full rounded-xl overflow-hidden mb-10">
                        <thead className=' bg-green-800 text-white'>
                            <tr>
                                <th className=' py-2 '>Site</th>
                                <th className=' py-2 '>Username</th>
                                <th className=' py-2 '>Password</th>
                                <th className=' py-2 '>Actions</th>
                            </tr>
                        </thead>
                        <tbody className=' bg-green-100'>
                            {passwordArray.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        {/* SITE */}
                                        <td className='py-2 border border-white text-center w-32'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <a
                                                    href={item.site.startsWith("http") ? item.site : `https://${item.site}`}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='text-blue-600 hover:underline'
                                                >
                                                    {item.site}
                                                </a>
                                                <img
                                                    onClick={() => copytext(item.site)}
                                                    src="icons/copy.png"
                                                    alt="Copy"
                                                    width={16}
                                                    className='cursor-pointer'
                                                    title="Copy Site"
                                                />
                                            </div>
                                        </td>

                                        {/* USERNAME */}
                                        <td className='py-2 border border-white text-center w-32'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <span>{item.username}</span>
                                                <img
                                                    onClick={() => copytext(item.username)}
                                                    src="icons/copy.png"
                                                    alt="Copy"
                                                    width={16}
                                                    className='cursor-pointer'
                                                    title="Copy Username"
                                                />
                                            </div>
                                        </td>

                                        {/* PASSWORD */}
                                        <td className='py-2 border border-white text-center w-32'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <span>{"*".repeat(item.password.length)}</span>
                                                <img
                                                    onClick={() => copytext(item.password)}
                                                    src="icons/copy.png"
                                                    alt="Copy"
                                                    width={16}
                                                    className='cursor-pointer'
                                                    title="Copy Password"
                                                />
                                            </div>
                                        </td>
                                        <td className='justify-center py-2 w-2 border border-white text-center'>
                                            <span className='cursor-pointer mx-1' onClick={() => { editPassword(item.id) }}>
                                                <script src="https://cdn.lordicon.com/lordicon.js"></script>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/meaqueth.json"
                                                    trigger="hover"
                                                    style={{ "width": "25px", "height": "25px" }}>
                                                </lord-icon>
                                            </span>
                                            <span className='cursor-pointer mx-1' onClick={() => { deletePassword(item.id) }}>
                                                <script src="https://cdn.lordicon.com/lordicon.js"></script>
                                                <lord-icon
                                                    src="https://cdn.lordicon.com/xyfswyxf.json"
                                                    trigger="hover"
                                                    style={{ "width": "25px", "height": "25px" }}>
                                                </lord-icon>
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>}
                </div>
            </div>
        </>
    )
}

export default Manager
