import React, { Component, PropTypes } from 'react'
import styler from 'react-styling'
import classNames from 'classnames'

import Form       from './form'
import Text_input from './text input'

export default class Steps extends Component
{
	state =
	{
		step  : 1, // start with step No 1
		store : {} // cumulative steps data
	}

	static propTypes =
	{
		set_last_step : PropTypes.func,
		on_finished   : PropTypes.func.isRequired,
		children      : PropTypes.node.isRequired,
		style         : PropTypes.object,
		className     : PropTypes.string
	}

	constructor(props, context)
	{
		super(props, context)

		this.step   = this.step.bind(this)
		this.submit = this.submit.bind(this)
		this.next   = this.next.bind(this)
	}

	render()
	{
		const { className, style } = this.props

		const markup =
		(
			<div className={className} style={style}>
				{this.enhance_step(this.current_step_element())}
			</div>
		)

		return markup
	}

	enhance_step(step)
	{
		return React.cloneElement(step,
		{
			ref     : this.step,
			submit  : this.next,
			state   : this.state.store
		})
	}

	current_step_element()
	{
		const step = React.Children.toArray(this.props.children).filter((child, index) =>
		{
			return index + 1 === this.state.step
		})
		[0]

		if (!step)
		{
			throw new Error(`No step #${this.state.step} found`)
		}

		return step
	}

	step_count()
	{
		return React.Children.count(this.props.children)
	}

	// ref={this.step}
	step(component)
	{
		// Will be .submit()-ted
		this.current_step = component
	}

	submit()
	{
		this.current_step.submit()
	}

	next(store)
	{
		// If current step submission succeeded, then move on to the next step

		// If there are no more steps left, then finished
		if (this.state.step === this.step_count())
		{
			this.setState({ store: {} })
			this.props.on_finished(store)
			return
		}

		// Else, if there are more steps left, go to the next one
		// updating the obtained `store` data.
		this.setState({ store, step: this.state.step + 1 })

		// Check if the new step is gonna be the last one
		if (this.props.set_last_step)
		{
			this.props.set_last_step(this.state.step + 1 === this.step_count())
		}
	}
}

export class Text_input_step extends Component
{
	state = {}

	static propTypes =
	{
		submit      : PropTypes.func.isRequired,
		validate    : PropTypes.func,
		description : PropTypes.string,
		placeholder : PropTypes.string,
		password    : PropTypes.bool,
		email       : PropTypes.bool,
		submit      : PropTypes.func.isRequired,
		busy        : PropTypes.bool,
		error       : PropTypes.object,
		className   : PropTypes.string,
		style       : PropTypes.object
	}
	
	constructor(props, context)
	{
		super(props, context)

		this.set_value    = this.set_value.bind(this)
		this.submit       = this.submit.bind(this)
		this.submit_form  = this.submit_form.bind(this)
		this.focus        = this.focus.bind(this)
	}

	render()
	{
		const { email, password, description, placeholder, validate, error, busy } = this.props
		const { value } = this.state

		const markup =
		(
			<Form
				ref="form"
				busy={busy}
				focus={this.focus}
				action={this.submit_form}
				error={error}>

				<Text_input
					ref="input"
					name="input"
					email={email}
					password={password}
					description={description}
					placeholder={placeholder}
					value={value}
					disabled={busy}
					invalid={validate(value)}
					on_change={this.set_value}/>
			</Form>
		)

		return markup
	}

	// Public API
	focus(name = 'input')
	{
		this.refs[name].focus()
	}

	// Public API
	submit()
	{
		this.refs.form.submit()
	}

	// // Public API
	// submit()
	// {
	// 	if (!this.refs.input.validate())
	// 	{
	// 		return this.refs.input.focus({ preserve_validation: true })
	// 	}
	//
	// 	this.props.submit(this.state.value)
	// }

	submit_form()
	{
		this.props.submit(this.state.value)
	}

	set_value(value)
	{
		this.setState({ value })
	}
}