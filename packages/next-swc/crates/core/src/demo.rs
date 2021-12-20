use swc_common::DUMMY_SP;
use swc_ecmascript::ast::*;
use swc_ecmascript::utils::{
  ident::{Id, IdentLike},
  HANDLER,
};
use swc_ecmascript::visit::{Fold, FoldWith};

pub fn my_transform() -> impl Fold {
  MyTransform::default()
}

#[derive(Debug, Default)]
struct MyTransform {
  do_something_binding: Option<Id>,
  inside_some_expected_export: bool,
  inside_another_expected_export: bool,
  called_do_something: bool,
}

impl Fold for MyTransform {
  fn fold_import_decl(&mut self, decl: ImportDecl) -> ImportDecl {
    let ImportDecl {
      ref src,
      ref specifiers,
      ..
    } = decl;
    if &src.value == "some-library" {
      for specifier in specifiers {
        match specifier {
          ImportSpecifier::Default(default_specifier) => {
            self.do_something_binding = Some(default_specifier.local.to_id())
          }
          _ => {}
        }
      }
    }

    decl
  }

  fn fold_export_decl(&mut self, mut decl: ExportDecl) -> ExportDecl {
    match &mut decl.decl {
      Decl::Fn(fn_decl) => {
        if &*fn_decl.ident.sym == "someExpectedExport" {
          self.inside_some_expected_export = true;
        } else if &*fn_decl.ident.sym == "anotherExpectedExport" {
          self.inside_another_expected_export = true;
        }
      }
      _ => {}
    }
    let decl = decl.fold_children_with(self);
    if (self.inside_some_expected_export || self.inside_another_expected_export)
      && !self.called_do_something
    {
      HANDLER.with(|handler| {
        handler
          .struct_span_err(decl.span, "Expected exports must call `doSomething`")
          .emit()
      });
    }
    self.inside_some_expected_export = false;
    self.inside_another_expected_export = false;
    self.called_do_something = false;
    decl
  }

  fn fold_call_expr(&mut self, mut call_expr: CallExpr) -> CallExpr {
    if let ExprOrSuper::Expr(e) = &call_expr.callee {
      if let Expr::Ident(ident) = &**e {
        dbg!(&ident.to_id());
        dbg!(self.do_something_binding.as_ref().unwrap());
        if &ident.to_id() == self.do_something_binding.as_ref().unwrap() {
          if !self.inside_another_expected_export && !self.inside_some_expected_export {
            HANDLER.with(|handler| {
              handler
                .struct_span_err(
                  call_expr.span,
                  "`doSomething` cannot be called outside expected exports",
                )
                .emit()
            });
          }

          if call_expr.args.len() != 1 {
            HANDLER.with(|handler| {
              handler
                .struct_span_err(call_expr.span, "`doSomething` expects exactly one argument")
                .emit()
            });
          }

          self.called_do_something = true;
          let second_arg = if self.inside_some_expected_export {
            "some additional input"
          } else {
            "different additional input"
          };
          call_expr.args.push(ExprOrSpread {
            spread: None,
            expr: Box::new(Expr::Lit(Lit::Str(Str {
              value: second_arg.into(),
              span: DUMMY_SP,
              has_escape: false,
              kind: StrKind::Synthesized {},
            }))),
          });
        }
      }
    }
    call_expr.fold_children_with(self)
  }
}
