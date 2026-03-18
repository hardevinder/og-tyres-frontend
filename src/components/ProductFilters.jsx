import React, { useEffect, useState } from "react";
import { Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { Search, X } from "lucide-react";

export default function ProductFilters({
  value = "",
  onChange,
  placeholder = "Search products...",
  delay = 500,
  className = "",
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof onChange === "function") {
        onChange(localValue);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [localValue, delay, onChange]);

  return (
    <div className={`product-filters-wrap mb-3 ${className}`}>
      <Row className="g-2 align-items-center">
        <Col xs={12} md={8} lg={6}>
          <InputGroup>
            <InputGroup.Text>
              <Search size={16} />
            </InputGroup.Text>

            <Form.Control
              type="text"
              value={localValue}
              placeholder={placeholder}
              onChange={(e) => setLocalValue(e.target.value)}
            />

            {!!localValue?.trim() && (
              <Button
                variant="outline-secondary"
                onClick={() => setLocalValue("")}
                title="Clear search"
              >
                <X size={16} />
              </Button>
            )}
          </InputGroup>
        </Col>
      </Row>
    </div>
  );
}