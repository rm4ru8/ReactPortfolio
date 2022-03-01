import React, { useState, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import './Chart.css';


const Chart = () => {
    const [govData,setGovData] = useState([])
    const [district,setDistrict] = useState([])
    const [chartData, setChartData] = useState([])
    const [chartOption,setChartOption] = useState({
        backgroundColor: '#f5f5f5',
        xAxis: { 
            type: 'category',
            axisLabel: {
                fontWeight : 'bolder',
                fontSize : 16
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: (p) => {
                    if(p === 0) return 0
                    return (p*0.001) + "K"
                }
            }
        },
        dimensions: [
            'fieldName', 
            {name: 'male', displayName: '男'}, 
            {name: 'female', displayName: '女'}
        ],
        series: [
            { 
                type: 'bar',
                color: '#6fabe7',
                label: {
                    show: true,
                    position: 'top',
                    color: '#6E6E6E',
                    fontSize: 12,
                    formatter: (p) => {
                        return formatNum(p.value.male)
                    }
                }
            },{ 
                type: 'bar', 
                color: '#f896c3',
                label: {
                    show: true,
                    position: 'top',
                    color: '#6E6E6E',
                    fontSize: 12,
                    formatter: (p) => {
                        return formatNum(p.value.female)
                    }
                }
            }
        ]
    })

    const fetchData = async () => {
        const res = await fetch("v1/rest/datastore/301000000A-000082-045")
        const data = await res.json()
        let records = data.result.records
        let govData = []      // 台北市各區人數
        let district = ['全區']   // 台北市各區
        records.forEach(item => {
            if(item.site_id.includes("臺北市")){
                item.district = item.site_id.substring(3,item.site_id.length)
                govData.push(item)
                if(!district.includes(item.district)){
                    district.push(item.district)
                }
            }
        })
        return {govData, district}
    }
    
    useEffect( async () => {
        const {govData, district} = await fetchData()
        setGovData(govData)
        setDistrict(district)
        initChartData(govData,null)
    },[])
    
    const initChartData = (govData, e) => {
        let arr = [0,0,0,0]
        govData.forEach(item => {
            if(e){
                if(e.target.value === '全區' || item.district === e.target.value)
                    arr = sum(arr,item)
            } else  arr = sum(arr,item)
        })
        let chartData = [
            {
                fieldName: '共同生活戶',
                male: arr[0],
                female: arr[1],
            },{
                fieldName: '單獨生活戶',
                male: arr[2],
                female: arr[3],
            }
        ]
        setChartData(chartData)
    }

    const sum = (arr, item) => {
        arr[0] = arr[0] + parseInt(item.household_ordinary_m)
        arr[1] = arr[1] + parseInt(item.household_ordinary_f)
        arr[2] = arr[2] + parseInt(item.household_single_m)
        arr[3] = arr[3] + parseInt(item.household_single_f)
        return arr
    }

    const selectChange = (e) => {
       initChartData(govData, e)
    }

    const formatNum = (value) => {
        if (!value && value !== 0) return 0;
        let str = value.toString();
        let reg = str.indexOf(".") > -1 ? 
            /(\d)(?=(\d{3})+\.)/g : 
            /(\d)(?=(?:\d{3})+$)/g;
        return str.replace(reg, "$1,");
    }

    return ( 
        <div className='chart'>
        {
            district.length > 0 ?
                (<>
                    <span>台北市</span>
                    <select name="itemName" onChange={selectChange} >
                        {
                            district.map((item,index)=>{
                                if(index === 0){
                                    return <option key={index} defaultValue>{item}</option>
                                }
                                return <option key={index}>{item}</option>
                            })
                        }
                    </select>
                    <ReactEcharts
                        option={{
                            legend: {},
                            tooltip: {},
                            backgroundColor: chartOption.backgroundColor,
                            xAxis: chartOption.xAxis,
                            yAxis: chartOption.yAxis,
                            dataset: {
                                dimensions: chartOption.dimensions,
                                source: chartData
                            },
                            series: chartOption.series
                        }}
                    />
                </>)
            :
                '資料載入中'
        }
        </div>
    )
}

export default Chart;