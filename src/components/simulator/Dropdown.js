import React from 'react'
import { Flex, Option, Select } from '../blocks/blockAPI'


export function DropdownVar({ id, name, sel, options, ...cssProps }) {
  return (
    <Flex f='FS' w='250px' h='30px' cn='rel' mt='10px'>
      <Flex f='FS' w='30px' cn='rig h100 font-small'>
        {name}
      </Flex>
      <Select id={id} w='200px' h='30px' bc='#bbb' cn='rel ptr grow font-dropdown' name={name} {...cssProps}>
        {options.map(item => <Option key={item} cn='w100 bc-l1 c-d1' mt='1px' selected={item === sel} >{item}</Option>)}
      </Select>
    </Flex>
  )
}

export function DropdownConst({ id, name, options, sel, disabled = false, w, lw, ...cssProps }) {
  return (
    <Flex f='FS' w={w ? w : '100px'} h='25px' cn='rel' mt='5px'>
      <Flex f='FE' w={lw ? lw : '30px'}  cn='rig h100 font-small' mr='5px'>
        {name}
      </Flex>
      <Select id={id} w='100px' h='25px' bc='#bbb' cn={`rel ${disabled ? '' : 'ptr'} grow font-dropdown`} name={name} disabled={disabled} {...cssProps}>
        {options.map(item => <Option key={item} cn='w100 bc-l1 c-d1' mt='1px' selected={item === sel}>{item}</Option>)}
      </Select>
    </Flex>
  )
}

export function DropdownOpt({ id, name, options, ...cssProps }) {
  return (
    <Flex f='FS' w='230px' h='30px' cn='rel' mt='10px'>
      {/* <Flex f='FS' w='100px' cn='rig h100 font-title'>
        {name}
      </Flex> */}
      <Select id={id} w='200px' h='30px' bc='#bbb' cn='rel ptr grow font-dropdown' name={name} {...cssProps}>
        {options.map(item => <Option key={item} cn='w100 bc-l1 c-d1' mt='1px'>{item}</Option>)}
      </Select>
    </Flex>
  )
}
