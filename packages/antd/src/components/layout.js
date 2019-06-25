import React, { Component, useEffect, useRef } from 'react'
import { createVirtualBox } from '@uform/react'
import { toArr } from '@uform/utils'
import { Card, Row, Col } from 'antd'
import { FormConsumer, FormItem, FormProvider } from '../form'
import styled from 'styled-components'
import cls from 'classnames'

const normalizeCol = (col, _default = 0) => {
  if (!col) return _default
  return typeof col === 'object' ? col : { span: col }
}

export const FormLayout = createVirtualBox(
  'layout',
  ({ children, ...props }) => {
    return (
      <FormConsumer>
        {value => {
          let newValue = { ...value, ...props }
          let child =
            newValue.inline || newValue.className || newValue.style ? (
              <div
                className={cls(newValue.className, {
                  'ant-form ant-form-inline': !!newValue.inline
                })}
                style={newValue.style}
              >
                {children}
              </div>
            ) : (
              children
            )
          return <FormProvider value={newValue}>{child}</FormProvider>
        }}
      </FormConsumer>
    )
  }
)

export const FormItemGrid = createVirtualBox(
  'grid',
  class extends Component {
    renderFormItem(children) {
      const { title, description, name, help, extra, ...others } = this.props
      return React.createElement(
        FormConsumer,
        {},
        ({
          labelAlign,
          labelTextAlign,
          labelCol,
          wrapperCol,
          size,
          autoAddColon
        }) => {
          return React.createElement(
            FormItem,
            {
              labelAlign,
              labelTextAlign,
              labelCol,
              wrapperCol,
              autoAddColon,
              size,
              ...others,
              label: title,
              noMinHeight: true,
              id: name,
              extra: description,
              help
            },
            children
          )
        }
      )
    }

    renderGrid() {
      let {
        children,
        cols,
        title,
        description,
        help,
        extra,
        ...props
      } = this.props
      children = toArr(children)
      cols = toArr(cols).map(col => normalizeCol(col))
      const childNum = children.length

      if (cols.length < childNum) {
        let offset = childNum - cols.length
        let lastSpan =
          24 -
          cols.reduce((buf, col) => {
            return (
              buf +
              Number(col.span ? col.span : 0) +
              Number(col.offset ? col.offset : 0)
            )
          }, 0)
        for (let i = 0; i < offset; i++) {
          cols.push(parseInt(lastSpan / offset))
        }
      }
      cols = toArr(cols).map(col => normalizeCol(col))
      return (
        <Row {...props}>
          {children.reduce((buf, child, key) => {
            return child
              ? buf.concat(
                <Col key={key} {...cols[key]}>
                  {child}
                </Col>
              )
              : buf
          }, [])}
        </Row>
      )
    }

    render() {
      const { title } = this.props
      if (title) {
        return this.renderFormItem(this.renderGrid())
      } else {
        return this.renderGrid()
      }
    }
  }
)

export const FormCard = createVirtualBox(
  'card',
  styled(
    class extends Component {
      static defaultProps = {
        // bodyHeight: 'auto'
      }
      render() {
        const { children, className, ...props } = this.props
        return (
          <Card className={className} {...props}>
            {children}
          </Card>
        )
      }
    }
  )`
    margin-bottom: 30px;
    .ant-card-body {
      padding-top: 30px;
      padding-bottom: 0 !important;
    }
    &.ant-card {
      display: block;
      margin-bottom: 30px;
    }
  `
)

export const FormBlock = createVirtualBox(
  'block',
  styled(
    class extends Component {
      static defaultProps = {
        // bodyHeight: 'auto'
      }
      render() {
        const { children, className, ...props } = this.props
        return (
          <Card className={className} {...props}>
            {children}
          </Card>
        )
      }
    }
  )`
    margin-bottom: 0px;
    .ant-card-body {
      padding-top: 20px;
      padding-bottom: 0 !important;
    }
    &.ant-card {
      border: none;
      padding: 0 15px;
      padding-bottom: 15px;
      display: block;
      box-shadow: none;
    }
    .ant-card-head {
      padding: 0 !important;
      min-height: 24px;
      font-weight: normal;
    }
    .ant-card-head-title {
      padding: 0;
    }
  `
)

export const FormTextBox = createVirtualBox(
  'text-box',
  styled(
    ({
      title,
      description,
      help,
      gutter,
      className,
      text,
      name,
      extra,
      children,
      ...props
    }) => {
      const ref = useRef()
      const arrChildren = toArr(children)
      const split = text.split('%s')
      useEffect(() => {
        if (ref.current) {
          const eles = ref.current.querySelectorAll('.text-box-field')
          eles.forEach(el => {
            const ctrl = el.querySelector(
              '.ant-form-item-control>*:not(.ant-form-item-space)'
            )
            if (ctrl) {
              el.style.width = getComputedStyle(ctrl).width
            }
          })
        }
      }, [])
      let index = 0
      const newChildren = split.reduce((buf, item, key) => {
        return buf.concat(
          <span key={index++} className="text-box-words">
            {item}
          </span>,
          <div key={index++} className="text-box-field">
            {arrChildren[key]}
          </div>
        )
      }, [])

      if (!title) {
        return (
          <div className={className} ref={ref}>
            {newChildren}
          </div>
        )
      }

      return React.createElement(
        FormConsumer,
        {},
        ({
          labelAlign,
          labelTextAlign,
          labelCol,
          wrapperCol,
          size,
          autoAddColon
        }) => {
          return React.createElement(
            FormItem,
            {
              labelAlign,
              labelTextAlign,
              labelCol,
              wrapperCol,
              autoAddColon,
              size,
              ...props,
              label: title,
              noMinHeight: true,
              id: name,
              extra: description,
              help
            },
            <div className={className} ref={ref}>
              {newChildren}
            </div>
          )
        }
      )
    }
  )`
    display: flex;
    .text-box-words {
      font-size: 12px;
      line-height: 34px;
      color: #333;
    }
    .text-box-field {
      display: inline-block;
      margin: 0 ${props => props.gutter || 10}px;
    }
  `
)
